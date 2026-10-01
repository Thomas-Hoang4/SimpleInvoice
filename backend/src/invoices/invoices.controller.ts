import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new invoice with draft status' })
  @ApiResponse({
    status: 201,
    description: 'Invoice successfully created',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or missing required fields',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: 409,
    description: 'Invoice number already exists',
  })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.create(userId, createInvoiceDto);
  }
}
