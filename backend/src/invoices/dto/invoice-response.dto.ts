import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: 'c1d2e3f4-0000-0000-0000-000000000001' })
  id: string;

  @ApiProperty({ example: 'Paul' })
  fullname: string;

  @ApiProperty({ example: 'paul@101digital.io' })
  email: string;

  @ApiPropertyOptional({ example: '947717364111' })
  mobileNumber?: string;

  @ApiPropertyOptional({ example: 'Singapore' })
  address?: string;
}

export class InvoiceItemResponseDto {
  @ApiProperty({ example: 'i1d2e3f4-0000-0000-0000-000000000001' })
  id: string;

  @ApiProperty({ example: 'Honda RC150' })
  name: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 1000.0 })
  rate: number;
}

export class InvoiceResponseDto {
  @ApiProperty({ example: '099ca7da-a290-40fa-93b9-1c43ae7bb887' })
  invoiceId: string;

  @ApiProperty({ example: 'IV1780488206995' })
  invoiceNumber: string;

  @ApiPropertyOptional({ example: '#5721662' })
  invoiceReference?: string;

  @ApiProperty({ example: '2026-06-03' })
  invoiceDate: string;

  @ApiProperty({ example: '2026-07-03' })
  dueDate: string;

  @ApiProperty({ example: 'AUD' })
  currency: string;

  @ApiProperty({ example: 'AU$' })
  currencySymbol: string;

  @ApiPropertyOptional({ example: 'Invoice is issued to Paul' })
  description?: string;

  @ApiProperty({ example: 'Draft', enum: ['Draft', 'Pending', 'Paid', 'Overdue'] })
  status: string;

  @ApiProperty({ example: 2000.0 })
  invoiceSubTotal: number;

  @ApiProperty({ example: 200.0 })
  totalTax: number;

  @ApiProperty({ example: 20.0 })
  totalDiscount: number;

  @ApiProperty({ example: 2180.0 })
  totalAmount: number;

  @ApiProperty({ example: 0.0 })
  totalPaid: number;

  @ApiProperty({ example: 2180.0 })
  balanceAmount: number;

  @ApiProperty({ type: () => CustomerResponseDto })
  customer: CustomerResponseDto;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];

  @ApiProperty({ example: '2026-06-03T12:03:26.995Z' })
  createdAt: Date;

  @ApiProperty({ example: 'ad1e0902-1928-4345-b513-60c86c94fc91' })
  createdBy: string;
}

export class PagingDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 36 })
  total: number;
}

export class PaginatedInvoicesResponseDto {
  @ApiProperty({ type: [InvoiceResponseDto] })
  data: InvoiceResponseDto[];

  @ApiProperty({ type: PagingDto })
  paging: PagingDto;
}

