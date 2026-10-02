import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let service: InvoicesService;

  const mockInvoicesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
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

  describe('findAll', () => {
    it('should delegate listing to InvoicesService', async () => {
      const query = { page: 1, pageSize: 10, keyword: 'Paul' };
      const expectedResponse = {
        data: [],
        paging: { page: 1, pageSize: 10, total: 0 },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResponse as any);

      const result = await controller.findAll(query as any);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('should delegate findOne to InvoicesService with id', async () => {
      const invoiceId = 'inv-uuid-1';
      const expectedInvoice = {
        invoiceId,
        invoiceNumber: 'INV-TEST-001',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedInvoice as any);

      const result = await controller.findOne(invoiceId);
      expect(service.findOne).toHaveBeenCalledWith(invoiceId);
      expect(result).toEqual(expectedInvoice);
    });
  });

  describe('create', () => {
    it('should delegate invoice creation to InvoicesService', async () => {
      const dto = {
        customerName: 'Paul',
        customerEmail: 'paul@simpleinvoice.dev',
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
