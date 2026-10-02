import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDueDateOnOrAfterInvoiceDate(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDueDateOnOrAfterInvoiceDate',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'dueDate must be on or after invoiceDate',
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          if (!value || !obj.invoiceDate) return true;
          const invoiceDate = new Date(obj.invoiceDate);
          const dueDate = new Date(value);
          if (isNaN(invoiceDate.getTime()) || isNaN(dueDate.getTime())) {
            return false;
          }
          return dueDate.getTime() >= invoiceDate.getTime();
        },
      },
    });
  };
}

export class InvoiceLineItemDto {
  @ApiProperty({ example: 'Honda RC150', description: 'Item name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2, description: 'Item quantity' })
  @IsInt({ message: 'item quantity must be an integer' })
  @Min(1, { message: 'item quantity must be positive' })
  quantity: number;

  @ApiProperty({ example: 1000.0, description: 'Item unit rate' })
  @IsNumber({}, { message: 'item rate must be a valid number' })
  @IsPositive({ message: 'item rate must be positive' })
  rate: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'Paul', description: 'Customer full name' })
  @IsString()
  @IsNotEmpty({ message: 'customer name must not be empty' })
  customerName: string;

  @ApiProperty({ example: 'paul@simpleinvoice.dev', description: 'Customer email' })
  @IsEmail({}, { message: 'customer email must be a valid email' })
  @IsNotEmpty({ message: 'customer email must not be empty' })
  customerEmail: string;

  @ApiPropertyOptional({
    example: '947717364111',
    description: 'Customer mobile number',
  })
  @IsOptional()
  @IsString()
  customerMobile?: string;

  @ApiPropertyOptional({
    example: 'Singapore',
    description: 'Customer physical address',
  })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiProperty({
    example: 'IV1780488206995',
    description: 'User-provided unique invoice number',
  })
  @IsString()
  @IsNotEmpty({ message: 'invoice number must not be empty' })
  invoiceNumber: string;

  @ApiPropertyOptional({
    example: '#5721662',
    description: 'External reference number',
  })
  @IsOptional()
  @IsString()
  invoiceReference?: string;

  @ApiProperty({ example: '2026-06-03', description: 'Invoice issue date' })
  @IsNotEmpty({ message: 'invoice date must not be empty' })
  invoiceDate: string;

  @ApiProperty({ example: '2026-07-03', description: 'Invoice due date' })
  @IsNotEmpty({ message: 'due date must not be empty' })
  @IsDueDateOnOrAfterInvoiceDate()
  dueDate: string;

  @ApiPropertyOptional({
    example: 'AUD',
    default: 'AUD',
    description: 'Invoice currency code',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'AU$',
    default: 'AU$',
    description: 'Invoice currency symbol',
  })
  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @ApiPropertyOptional({
    example: 'Invoice is issued to Paul',
    description: 'Invoice memo/notes',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // Single item direct fields
  @ApiPropertyOptional({ example: 'Honda RC150', description: 'Line item name' })
  @IsOptional()
  @IsString()
  itemName?: string;

  @ApiPropertyOptional({ example: 2, description: 'Line item quantity' })
  @IsOptional()
  @IsInt({ message: 'item quantity must be an integer' })
  @Min(1, { message: 'item quantity must be positive' })
  itemQuantity?: number;

  @ApiPropertyOptional({ example: 1000.0, description: 'Line item unit rate' })
  @IsOptional()
  @IsNumber({}, { message: 'item rate must be a valid number' })
  @IsPositive({ message: 'item rate must be positive' })
  itemRate?: number;

  // Multiple / structured line items support
  @ApiPropertyOptional({
    type: [InvoiceLineItemDto],
    description: 'Itemized list of line items',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  items?: InvoiceLineItemDto[];

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Tax percentage',
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'tax must be non-negative' })
  tax?: number;

  @ApiPropertyOptional({
    example: 20,
    default: 0,
    description: 'Discount amount',
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'discount must be non-negative' })
  discount?: number;
}
