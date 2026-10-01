import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: PrismaService;

  const mockPrisma = {
    invoice: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    customer: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validDto = {
      customerName: 'Paul',
      customerEmail: 'paul@101digital.io',
      customerMobile: '947717364111',
      customerAddress: 'Singapore',
      invoiceNumber: 'INV-TEST-001',
      invoiceDate: '2026-11-01',
      dueDate: '2026-12-01',
      itemName: 'Honda RC150',
      itemQuantity: 2,
      itemRate: 1000,
      tax: 10,
      discount: 20,
    };

    it('should throw ConflictException if invoiceNumber already exists', async () => {
      jest.spyOn(prisma.invoice, 'findUnique').mockResolvedValue({
        invoiceId: 'existing-id',
        invoiceNumber: 'INV-TEST-001',
      } as any);

      await expect(
        service.create('user-id-123', validDto as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if no line items are provided', async () => {
      jest.spyOn(prisma.invoice, 'findUnique').mockResolvedValue(null);

      const invalidDto = {
        ...validDto,
        itemName: undefined,
        itemQuantity: undefined,
        itemRate: undefined,
        items: [],
      };

      await expect(
        service.create('user-id-123', invalidDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create an invoice in a transaction with calculated totals and Draft status for future due dates', async () => {
      jest.spyOn(prisma.invoice, 'findUnique').mockResolvedValue(null);

      const mockCustomer = {
        id: 'cust-id-1',
        fullname: 'Paul',
        email: 'paul@101digital.io',
        mobileNumber: '947717364111',
        address: 'Singapore',
      };

      const mockCreatedInvoice = {
        invoiceId: 'new-inv-id',
        invoiceNumber: 'INV-TEST-001',
        invoiceReference: null,
        invoiceDate: new Date('2026-11-01'),
        dueDate: new Date('2026-12-01'),
        currency: 'AUD',
        currencySymbol: 'AU$',
        description: null,
        status: 'Draft',
        invoiceSubTotal: 2000,
        totalTax: 200,
        totalDiscount: 20,
        totalAmount: 2180,
        totalPaid: 0,
        balanceAmount: 2180,
        createdBy: 'user-id-123',
        customerId: 'cust-id-1',
        createdAt: new Date('2026-11-01T12:00:00Z'),
        customer: mockCustomer,
        items: [
          {
            id: 'item-1',
            invoiceId: 'new-inv-id',
            name: 'Honda RC150',
            quantity: 2,
            rate: 1000,
          },
        ],
      };

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback: any) => {
          const tx = {
            customer: {
              findFirst: jest.fn().mockResolvedValue(mockCustomer as any),
              update: jest.fn().mockResolvedValue(mockCustomer as any),
              create: jest.fn(),
            },
            invoice: {
              create: jest.fn().mockResolvedValue(mockCreatedInvoice as any),
            },
          };
          return callback(tx);
        });

      const result = await service.create('user-id-123', validDto as any);

      expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
        where: { invoiceNumber: 'INV-TEST-001' },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.invoiceNumber).toBe('INV-TEST-001');
      expect(result.invoiceSubTotal).toBe(2000);
      expect(result.totalTax).toBe(200);
      expect(result.totalDiscount).toBe(20);
      expect(result.totalAmount).toBe(2180);
      expect(result.balanceAmount).toBe(2180);
      expect(result.status).toBe('Draft');
    });

    it('should derive Overdue status when persisted invoice dueDate is in the past and unpaid', async () => {
      jest.spyOn(prisma.invoice, 'findUnique').mockResolvedValue(null);

      const pastDto = {
        ...validDto,
        invoiceDate: '2026-01-01',
        dueDate: '2026-02-01',
      };

      const mockCreatedPastInvoice = {
        invoiceId: 'past-inv-id',
        invoiceNumber: 'INV-TEST-PAST',
        invoiceDate: new Date('2026-01-01'),
        dueDate: new Date('2026-02-01'),
        status: 'Draft',
        invoiceSubTotal: 2000,
        totalTax: 200,
        totalDiscount: 0,
        totalAmount: 2200,
        totalPaid: 0,
        balanceAmount: 2200,
        customer: { id: 'c1', fullname: 'Paul', email: 'paul@101digital.io' },
        items: [{ id: 'i1', name: 'Honda', quantity: 2, rate: 1000 }],
      };

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback: any) => {
          const tx = {
            customer: {
              findFirst: jest.fn().mockResolvedValue({ id: 'c1' } as any),
              update: jest.fn().mockResolvedValue({ id: 'c1' } as any),
              create: jest.fn(),
            },
            invoice: {
              create: jest.fn().mockResolvedValue(mockCreatedPastInvoice as any),
            },
          };
          return callback(tx);
        });

      const result = await service.create('user-id-123', pastDto as any);
      expect(result.status).toBe('Overdue');
    });
  });
});
