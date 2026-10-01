import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let service: InvoicesService;

  const mockInvoicesService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoicesService,
          useValue: mockInvoicesService,
        },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
    service = module.get<InvoicesService>(InvoicesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate invoice creation to InvoicesService', async () => {
      const dto = {
        customerName: 'Paul',
        customerEmail: 'paul@101digital.io',
        invoiceNumber: 'INV-TEST-001',
        invoiceDate: '2026-06-03',
        dueDate: '2026-07-03',
        itemName: 'Honda RC150',
        itemQuantity: 2,
        itemRate: 1000,
      };

      const expectedResponse = {
        invoiceId: 'inv-uuid-1',
        invoiceNumber: 'INV-TEST-001',
        status: 'Draft',
        invoiceSubTotal: 2000,
        totalTax: 200,
        totalAmount: 2200,
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResponse as any);

      const result = await controller.create('user-1', dto as any);
      expect(service.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(expectedResponse);
    });
  });
});
