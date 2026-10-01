import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryInvoicesDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number (starts at 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Number of records per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    example: 'invoiceDate',
    enum: ['invoiceDate', 'dueDate', 'totalAmount'],
    default: 'invoiceDate',
    description: 'Field to sort records by',
  })
  @IsOptional()
  @IsIn(['invoiceDate', 'dueDate', 'totalAmount'])
  sortBy?: 'invoiceDate' | 'dueDate' | 'totalAmount' = 'invoiceDate';

  @ApiPropertyOptional({
    example: 'DESC',
    enum: ['ASC', 'DESC', 'asc', 'desc'],
    default: 'DESC',
    description: 'Sort ordering direction',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  ordering?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'DESC';

  @ApiPropertyOptional({
    example: 'Pending',
    enum: ['Draft', 'Pending', 'Paid', 'Overdue'],
    description: 'Invoice status filter (includes dynamic Overdue)',
  })
  @IsOptional()
  @IsIn(['Draft', 'Pending', 'Paid', 'Overdue'])
  status?: 'Draft' | 'Pending' | 'Paid' | 'Overdue';

  @ApiPropertyOptional({
    example: 'Paul',
    description: 'Case-insensitive search on invoice number or customer name',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Filter invoices issued on or after this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Filter invoices issued on or before this date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  toDate?: string;
}
