import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Invoices API (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  // In-memory store for E2E persistence simulation
  const mockUser = {
    id: 'ad1e0902-1928-4345-b513-60c86c94fc91',
    email: 'reviewer@101digital.io',
    passwordHash: bcrypt.hashSync('Password123!', 10),
    fullname: 'Reviewer User',
    createdAt: new Date('2026-06-01T00:00:00Z'),
  };

  const storedInvoices: any[] = [];
  const storedCustomers: any[] = [];

  const mockPrismaService = {
    $connect: async () => {},
    $disconnect: async () => {},
    user: {
      findUnique: async (args: any) => {
        if (args.where.email && args.where.email === mockUser.email) {
          return mockUser;
        }
        if (args.where.id && args.where.id === mockUser.id) {
          return mockUser;
        }
        return null;
      },
    },
    customer: {
      findFirst: async (args: any) => {
        return storedCustomers.find((c) => c.email === args.where.email) || null;
      },
      create: async (args: any) => {
        const newCust = {
          id: `cust-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
        };
        storedCustomers.push(newCust);
        return newCust;
      },
      update: async (args: any) => {
        const cust = storedCustomers.find((c) => c.id === args.where.id);
        if (cust) {
          Object.assign(cust, args.data);
          return cust;
        }
        return null;
      },
    },
    invoice: {
      findUnique: async (args: any) => {
        return storedInvoices.find((i) => i.invoiceNumber === args.where.invoiceNumber) || null;
      },
      findFirst: async (args: any) => {
        return (
          storedInvoices.find(
            (i) =>
              i.invoiceId === args.where.OR?.[0]?.invoiceId ||
              i.invoiceNumber === args.where.OR?.[1]?.invoiceNumber,
          ) || null
        );
      },
      findMany: async (args: any) => {
        let results = [...storedInvoices];
        if (args.where?.OR) {
          const keyword = args.where.OR[0].invoiceNumber.contains.toLowerCase();
          results = results.filter(
            (i) =>
              i.invoiceNumber.toLowerCase().includes(keyword) ||
              i.customer?.fullname?.toLowerCase().includes(keyword),
          );
        }
        return results;
      },
      count: async () => storedInvoices.length,
      create: async (args: any) => {
        const newInvoice = {
          invoiceId: `inv-${Date.now()}`,
          ...args.data,
          items: args.data.items?.create || [],
          customer: storedCustomers.find((c) => c.id === args.data.customerId),
          createdAt: new Date(),
        };
        storedInvoices.push(newInvoice);
        return newInvoice;
      },
    },
    $transaction: async (fn: any) => {
      const tx = {
        customer: mockPrismaService.customer,
        invoice: mockPrismaService.invoice,
      };
      return fn(tx);
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('rejects invalid login credentials with 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'reviewer@101digital.io',
          password: 'IncorrectPassword!',
        })
        .expect(401);

      expect(res.body).toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
      });
    });

    it('successfully logs in default reviewer user and returns JWT token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'reviewer@101digital.io',
          password: 'Password123!',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user).toMatchObject({
        id: mockUser.id,
        email: 'reviewer@101digital.io',
        fullname: 'Reviewer User',
      });

      authToken = res.body.accessToken;
    });

    it('returns current user profile on GET /auth/me with Bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: mockUser.id,
        email: 'reviewer@101digital.io',
        fullname: 'Reviewer User',
      });
    });
  });

  describe('Guard Protection', () => {
    it('blocks unauthenticated GET /invoices with 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .get('/invoices')
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });

    it('blocks unauthenticated POST /invoices with 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/invoices')
        .send({})
        .expect(401);

      expect(res.body.statusCode).toBe(401);
    });
  });

  describe('Invoice Validation & Business Calculations', () => {
    it('rejects invoice when dueDate is before invoiceDate', async () => {
      const res = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerName: 'Test Customer',
          customerEmail: 'customer@example.com',
          invoiceNumber: 'INV-INVALID-DATE',
          invoiceDate: '2026-12-15',
          dueDate: '2026-12-10', // Before invoice date!
          itemName: 'Item A',
          itemQuantity: 1,
          itemRate: 100,
        })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toContain('dueDate must be on or after invoiceDate');
      expect(res.body.error).toBe('Bad Request');
    });

    it('creates invoice, calculates totals server-side, and persists Draft status', async () => {
      const payload = {
        customerName: 'Sarah Jenkins',
        customerEmail: 'sarah.jenkins@acmecorp.com',
        customerMobile: '+61 412 345 678',
        customerAddress: '42 Wallaby Way, Sydney NSW',
        invoiceNumber: 'INV-E2E-1001',
        invoiceDate: '2026-11-01',
        dueDate: '2026-12-01',
        currency: 'AUD',
        currencySymbol: 'AU$',
        itemName: 'Enterprise Consulting',
        itemQuantity: 3,
        itemRate: 500,
        tax: 10,
        discount: 50,
      };

      const res = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.invoiceNumber).toBe('INV-E2E-1001');
      expect(res.body.status).toBe('Draft');
      // subTotal = 3 * 500 = 1500
      // taxAmount = 1500 * 0.10 = 150
      // totalAmount = 1500 + 150 - 50 = 1600
      expect(res.body.invoiceSubTotal).toBe(1500);
      expect(res.body.totalTax).toBe(150);
      expect(res.body.totalDiscount).toBe(50);
      expect(res.body.totalAmount).toBe(1600);
      expect(res.body.balanceAmount).toBe(1600);
      expect(res.body.customer.fullname).toBe('Sarah Jenkins');
    });

    it('lists created invoices via GET /invoices with server-side pagination shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, pageSize: 10, keyword: 'INV-E2E-1001' })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('paging');
      expect(res.body.paging).toMatchObject({
        page: 1,
        pageSize: 10,
      });
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].invoiceNumber).toBe('INV-E2E-1001');
    });

    it('retrieves detailed invoice breakdown via GET /invoices/:id', async () => {
      const res = await request(app.getHttpServer())
        .get('/invoices/INV-E2E-1001')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.invoiceNumber).toBe('INV-E2E-1001');
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe('Enterprise Consulting');
    });

    it('returns structured 404 for non-existent invoice ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/invoices/NON-EXISTENT-ID-999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body).toMatchObject({
        statusCode: 404,
        message: 'Invoice not found',
        error: 'Not Found',
      });
    });
  });
});
