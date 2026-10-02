import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import {
  calculateInvoiceAmounts,
  deriveInvoiceStatus,
  roundToTwoDecimals,
} from './engine/invoice-calculations';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to format Decimal and Date fields into clean JSON representation
   */
  public formatInvoice(invoice: any) {
    if (!invoice) return null;

    const dueDate = invoice.dueDate instanceof Date
      ? invoice.dueDate.toISOString().slice(0, 10)
      : invoice.dueDate;

    const invoiceDate = invoice.invoiceDate instanceof Date
      ? invoice.invoiceDate.toISOString().slice(0, 10)
      : invoice.invoiceDate;

    const derivedStatus = deriveInvoiceStatus(invoice.status, invoice.dueDate);

    return {
      ...invoice,
      invoiceDate,
      dueDate,
      status: derivedStatus,
      invoiceSubTotal: Number(invoice.invoiceSubTotal),
      totalTax: Number(invoice.totalTax),
      totalDiscount: Number(invoice.totalDiscount),
      totalAmount: Number(invoice.totalAmount),
      totalPaid: Number(invoice.totalPaid),
      balanceAmount: Number(invoice.balanceAmount),
      items: (invoice.items || []).map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };
  }

  async create(userId: string, dto: CreateInvoiceDto) {
    // 1. Check for duplicate invoiceNumber
    const existing = await this.prisma.invoice.findUnique({
      where: { invoiceNumber: dto.invoiceNumber.trim() },
    });

    if (existing) {
      throw new ConflictException(
        `Invoice number '${dto.invoiceNumber}' already exists`,
      );
    }

    // 2. Resolve items
    const items =
      dto.items && dto.items.length > 0
        ? dto.items
        : dto.itemName && dto.itemQuantity && dto.itemRate
        ? [
            {
              name: dto.itemName,
              quantity: dto.itemQuantity,
              rate: dto.itemRate,
            },
          ]
        : [];

    if (items.length === 0) {
      throw new BadRequestException(
        'At least one valid line item is required with name, quantity, and rate',
      );
    }

    // 3. Perform domain calculations
    const subTotal = roundToTwoDecimals(
      items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.rate),
        0,
      ),
    );

    const calculated = calculateInvoiceAmounts({
      quantity: 1,
      rate: subTotal,
      taxPercent: dto.tax,
      discount: dto.discount,
      totalPaid: 0,
    });

    // 4. Execute atomic transaction: customer upsert + invoice creation + items creation
    const createdInvoice = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Resolve customer by email
        const cleanEmail = dto.customerEmail.toLowerCase().trim();
        let customer = await tx.customer.findFirst({
          where: { email: cleanEmail },
        });

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              fullname: dto.customerName.trim(),
              email: cleanEmail,
              mobileNumber: dto.customerMobile?.trim() || null,
              address: dto.customerAddress?.trim() || null,
            },
          });
        } else if (dto.customerMobile || dto.customerAddress) {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              mobileNumber: dto.customerMobile?.trim() || customer.mobileNumber,
              address: dto.customerAddress?.trim() || customer.address,
            },
          });
        }

        // Create invoice with status Draft
        return tx.invoice.create({
          data: {
            invoiceNumber: dto.invoiceNumber.trim(),
            invoiceReference: dto.invoiceReference?.trim() || null,
            invoiceDate: new Date(dto.invoiceDate),
            dueDate: new Date(dto.dueDate),
            currency: dto.currency?.trim() || 'AUD',
            currencySymbol: dto.currencySymbol?.trim() || 'AU$',
            description: dto.description?.trim() || null,
            status: InvoiceStatus.Draft,
            invoiceSubTotal: subTotal,
            totalTax: calculated.taxAmount,
            totalDiscount: calculated.discount,
            totalAmount: calculated.totalAmount,
            totalPaid: 0,
            balanceAmount: calculated.balanceAmount,
            createdBy: userId,
            customerId: customer.id,
            items: {
              create: items.map((item) => ({
                name: item.name.trim(),
                quantity: item.quantity,
                rate: item.rate,
              })),
            },
          },
          include: {
            customer: true,
            items: true,
          },
        });
      },
    );

    return this.formatInvoice(createdInvoice);
  }

  async findAll(query: QueryInvoicesDto) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.max(1, Number(query.pageSize || 10));
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const sortBy = query.sortBy || 'invoiceDate';
    const sortOrder =
      (query.ordering || 'DESC').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.InvoiceOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const where: Prisma.InvoiceWhereInput = {};

    // 1. Keyword search (case-insensitive on invoiceNumber or customer fullname)
    if (query.keyword && query.keyword.trim()) {
      const term = query.keyword.trim();
      where.OR = [
        { invoiceNumber: { contains: term, mode: 'insensitive' } },
        { customer: { fullname: { contains: term, mode: 'insensitive' } } },
      ];
    }

    // 2. Date filters (invoiceDate range)
    if (query.fromDate || query.toDate) {
      where.invoiceDate = {};
      if (query.fromDate) {
        where.invoiceDate.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.invoiceDate.lte = new Date(query.toDate);
      }
    }

    // 3. Status filter with dynamic Overdue handling
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    if (query.status === 'Overdue') {
      where.status = { not: InvoiceStatus.Paid };
      where.dueDate = { lt: startOfToday };
    } else if (query.status === 'Paid') {
      where.status = InvoiceStatus.Paid;
    } else if (query.status === 'Pending') {
      where.status = InvoiceStatus.Pending;
      where.dueDate = { gte: startOfToday };
    } else if (query.status === 'Draft') {
      where.status = InvoiceStatus.Draft;
      where.dueDate = { gte: startOfToday };
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          customer: true,
          items: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const formattedData = invoices.map((inv: any) => this.formatInvoice(inv));

    return {
      data: formattedData,
      paging: {
        page,
        pageSize,
        total,
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        OR: [{ invoiceId: id }, { invoiceNumber: id }],
      },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.formatInvoice(invoice);
  }
}
