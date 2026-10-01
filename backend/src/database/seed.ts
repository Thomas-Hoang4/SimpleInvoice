import { PrismaClient, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface SeedItem {
  name: string;
  quantity: number;
  rate: number;
}

interface SeedInvoiceInput {
  invoiceNumber: string;
  invoiceReference?: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  currency?: string;
  currencySymbol?: string;
  description?: string;
  status: InvoiceStatus; // Draft | Pending | Paid (Overdue is derived)
  discount?: number;
  taxRate?: number; // e.g. 0.10 for 10%
  paidAmount?: number;
  customerIndex: number;
  items: SeedItem[];
  createdAt?: string;
}

async function main() {
  console.log('🌱 Starting SimpleInvoice database seed...');

  // 1. Clean existing records (idempotent seed)
  console.log('🧹 Cleaning existing records...');
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  console.log('👤 Seeding users...');
  const saltRounds = 10;
  const reviewerPasswordHash = await bcrypt.hash('Password123!', saltRounds);

  const reviewerUser = await prisma.user.create({
    data: {
      id: 'ad1e0902-1928-4345-b513-60c86c94fc91', // Exact Appendix A createdBy ID
      email: 'reviewer@101digital.io',
      passwordHash: reviewerPasswordHash,
      fullname: 'Reviewer User',
    },
  });

  const adminPasswordHash = await bcrypt.hash('Admin2026!Secure', saltRounds);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@simpleinvoice.dev',
      passwordHash: adminPasswordHash,
      fullname: 'System Admin',
    },
  });

  console.log(`✅ Seeded 2 users: ${reviewerUser.email}, ${adminUser.email}`);

  // 3. Create Customers
  console.log('👥 Seeding customers...');
  const customerData = [
    {
      fullname: 'Paul',
      email: 'paul@101digital.io',
      address: 'Singapore',
      mobileNumber: '947717364111',
    },
    {
      fullname: 'Sarah Jenkins',
      email: 'sarah.jenkins@acmecorp.com',
      address: '42 Wallaby Way, Sydney NSW 2000, Australia',
      mobileNumber: '+61 412 345 678',
    },
    {
      fullname: 'David Miller',
      email: 'david.miller@technovagroup.io',
      address: '100 Collins Street, Melbourne VIC 3000, Australia',
      mobileNumber: '+61 423 456 789',
    },
    {
      fullname: 'Elena Rostova',
      email: 'elena@quantumdynamics.org',
      address: '15 Canary Wharf, London E14 5AB, United Kingdom',
      mobileNumber: '+44 20 7946 0912',
    },
    {
      fullname: 'Marcus Chen',
      email: 'marcus.chen@nexuscloud.sg',
      address: '1 Marina Boulevard, #28-00, Singapore 018989',
      mobileNumber: '+65 6789 0123',
    },
    {
      fullname: 'Amara Okafor',
      email: 'amara.okafor@apexconsulting.com',
      address: '500 Howard Street, San Francisco, CA 94105, USA',
      mobileNumber: '+1 415 555 2671',
    },
    {
      fullname: 'Hiroshi Tanaka',
      email: 'tanaka.hiroshi@zenithsoft.jp',
      address: 'Roppongi Hills Mori Tower, Minato-ku, Tokyo 106-6108, Japan',
      mobileNumber: '+81 3 5555 0143',
    },
    {
      fullname: 'Chloe Dupont',
      email: 'chloe.dupont@lumina-agency.fr',
      address: '18 Rue de la Paix, 75002 Paris, France',
      mobileNumber: '+33 1 42 68 55 00',
    },
    {
      fullname: 'Oliver Smith',
      email: 'oliver.smith@smithandco.com.au',
      address: '12 Creek Street, Brisbane QLD 4000, Australia',
      mobileNumber: '+61 434 567 890',
    },
    {
      fullname: 'Priya Patel',
      email: 'priya.patel@horizontech.in',
      address: 'Bandra Kurla Complex, Mumbai 400051, India',
      mobileNumber: '+91 22 2490 1234',
    },
    {
      fullname: 'Lucas Silva',
      email: 'lucas.silva@innovacorp.br',
      address: 'Av. Paulista 1000, Bela Vista, São Paulo 01310-100, Brazil',
      mobileNumber: '+55 11 3045 6789',
    },
  ];

  const createdCustomers = [];
  for (const c of customerData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }
  console.log(`✅ Seeded ${createdCustomers.length} customers`);

  // 4. Seed Appendix A Invoice
  console.log('📄 Seeding Appendix A canonical invoice...');
  await prisma.invoice.create({
    data: {
      invoiceId: '099ca7da-a290-40fa-93b9-1c43ae7bb887',
      invoiceNumber: 'IV1780488206995',
      invoiceReference: '#5721662',
      invoiceDate: new Date('2026-06-03'),
      dueDate: new Date('2026-07-03'),
      currency: 'AUD',
      currencySymbol: 'AU$',
      description: 'Invoice is issued to Kanglee',
      status: InvoiceStatus.Pending, // Will derive Overdue (dueDate 2026-07-03 < today, balance 728.66)
      invoiceSubTotal: 2000.0,
      totalDiscount: 20.0,
      totalTax: 200.0,
      totalAmount: 2180.0,
      totalPaid: 1451.34,
      balanceAmount: 728.66,
      createdAt: new Date('2026-06-03T12:03:26.995Z'),
      createdBy: reviewerUser.id,
      customerId: createdCustomers[0].id, // Paul
      items: {
        create: [
          {
            id: 'b1c2d3e4-0000-0000-0000-000000000001',
            name: 'Honda RC150',
            quantity: 2,
            rate: 1000.0,
          },
        ],
      },
    },
  });

  // 5. Seed 35 Diverse Invoices
  console.log('📄 Seeding 35+ diverse invoices...');
  const diverseInvoices: SeedInvoiceInput[] = [
    // --- Draft Invoices (Not yet issued, totalPaid = 0, balance = totalAmount) ---
    {
      invoiceNumber: 'INV-2026-001',
      invoiceReference: 'PO-90412',
      invoiceDate: '2026-09-28',
      dueDate: '2026-10-28',
      description: 'Q4 Cloud Infrastructure Architecture Consulting',
      status: InvoiceStatus.Draft,
      discount: 50.0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 1, // Sarah
      items: [
        {
          name: 'Cloud Solution Architecture (Hours)',
          quantity: 20,
          rate: 180.0,
        },
        { name: 'Kubernetes Cluster Provisioning', quantity: 1, rate: 1500.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-002',
      invoiceReference: 'REF-8841',
      invoiceDate: '2026-10-01',
      dueDate: '2026-10-31',
      description: 'Brand Identity Design & Marketing Collateral',
      status: InvoiceStatus.Draft,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 7, // Chloe
      items: [
        { name: 'Vector Logo Package', quantity: 1, rate: 2200.0 },
        { name: 'Brand Typography Guidelines', quantity: 1, rate: 800.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-003',
      invoiceReference: 'PO-30114',
      invoiceDate: '2026-09-25',
      dueDate: '2026-10-25',
      description: 'Annual Software Maintenance Contract Draft',
      status: InvoiceStatus.Draft,
      discount: 200.0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 3, // Elena
      items: [
        { name: 'SaaS Platform Support SLA Tier 1', quantity: 12, rate: 350.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-004',
      invoiceReference: 'PO-11883',
      invoiceDate: '2026-09-30',
      dueDate: '2026-10-30',
      description: 'Mobile Application Wireframing & UX Research',
      status: InvoiceStatus.Draft,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 4, // Marcus
      items: [
        { name: 'User Persona Research', quantity: 2, rate: 750.0 },
        { name: 'Interactive Figma Prototype', quantity: 1, rate: 2500.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-005',
      invoiceReference: 'DRAFT-091',
      invoiceDate: '2026-10-01',
      dueDate: '2026-11-01',
      description: 'Security & Penetration Testing Assessment',
      status: InvoiceStatus.Draft,
      discount: 100.0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 5, // Amara
      items: [
        { name: 'Web Application Penetration Test', quantity: 1, rate: 3800.0 },
        { name: 'API Security Vulnerability Audit', quantity: 1, rate: 1600.0 },
      ],
    },

    // --- Paid Invoices (Fully settled, balance = 0, totalPaid = totalAmount) ---
    {
      invoiceNumber: 'INV-2026-006',
      invoiceReference: 'PAID-7721',
      invoiceDate: '2026-05-10',
      dueDate: '2026-06-10',
      description: 'Enterprise PostgreSQL Database Optimization',
      status: InvoiceStatus.Paid,
      discount: 0,
      taxRate: 0.1,
      customerIndex: 2, // David
      items: [
        { name: 'Database Query Indexing & Tuning', quantity: 15, rate: 200.0 },
        {
          name: 'Connection Pooler Setup (PgBouncer)',
          quantity: 1,
          rate: 850.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-007',
      invoiceReference: 'SETTLED-01',
      invoiceDate: '2026-06-15',
      dueDate: '2026-07-15',
      description: 'Frontend Modernization with Vite & React 18',
      status: InvoiceStatus.Paid,
      discount: 150.0,
      taxRate: 0.1,
      customerIndex: 6, // Hiroshi
      items: [
        { name: 'Webpack to Vite Migration', quantity: 1, rate: 3200.0 },
        { name: 'TanStack Query State Management', quantity: 1, rate: 1400.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-008',
      invoiceReference: 'CONF-4491',
      invoiceDate: '2026-07-01',
      dueDate: '2026-08-01',
      description: 'CI/CD Pipeline Automation & Automated Testing',
      status: InvoiceStatus.Paid,
      discount: 50.0,
      taxRate: 0.1,
      customerIndex: 8, // Oliver
      items: [
        { name: 'GitHub Actions Matrix Workflow', quantity: 1, rate: 1900.0 },
        {
          name: 'Vitest & Jest Unit Test Integration',
          quantity: 1,
          rate: 1100.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-009',
      invoiceReference: 'PAID-9921',
      invoiceDate: '2026-07-20',
      dueDate: '2026-08-20',
      description: 'SEO Optimization & Core Web Vitals Audit',
      status: InvoiceStatus.Paid,
      discount: 0,
      taxRate: 0.1,
      customerIndex: 9, // Priya
      items: [
        {
          name: 'Largest Contentful Paint (LCP) Fixes',
          quantity: 1,
          rate: 1250.0,
        },
        { name: 'Technical SEO & Structured Data', quantity: 1, rate: 950.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-010',
      invoiceReference: 'INV-SETTL-10',
      invoiceDate: '2026-08-05',
      dueDate: '2026-09-05',
      description: 'Microservices Architecture Review',
      status: InvoiceStatus.Paid,
      discount: 300.0,
      taxRate: 0.1,
      customerIndex: 10, // Lucas
      items: [
        { name: 'NestJS Microservices Blueprint', quantity: 1, rate: 4500.0 },
        { name: 'Kafka Event Stream Architecture', quantity: 1, rate: 2500.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-011',
      invoiceReference: 'PAID-5512',
      invoiceDate: '2026-08-15',
      dueDate: '2026-09-15',
      description: 'Hardware Equipment & High-Performance Workstation',
      status: InvoiceStatus.Paid,
      discount: 100.0,
      taxRate: 0.1,
      customerIndex: 1, // Sarah
      items: [
        {
          name: 'Apple M4 Max Developer Workstation',
          quantity: 1,
          rate: 5200.0,
        },
        { name: '4K Ultra-Wide Studio Display', quantity: 1, rate: 1800.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-012',
      invoiceReference: 'ACME-8819',
      invoiceDate: '2026-09-01',
      dueDate: '2026-09-25',
      description: 'Mobile App Store Deployment & Certification',
      status: InvoiceStatus.Paid,
      discount: 0,
      taxRate: 0.1,
      customerIndex: 2, // David
      items: [
        { name: 'iOS App Store Production Release', quantity: 1, rate: 1500.0 },
        {
          name: 'Google Play Store Release & Verification',
          quantity: 1,
          rate: 1200.0,
        },
      ],
    },

    // --- Pending Invoices (Active / Future Due Date, Not Overdue) ---
    {
      invoiceNumber: 'INV-2026-013',
      invoiceReference: 'PEND-101',
      invoiceDate: '2026-09-20',
      dueDate: '2026-10-20', // Future relative to 2026-10-02
      description: 'Monthly Cloud Managed Hosting & Monitoring',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 500.0, // Partial payment
      customerIndex: 3, // Elena
      items: [
        {
          name: 'AWS Dedicated Instance Managed Cluster',
          quantity: 1,
          rate: 1600.0,
        },
        { name: 'Datadog APM & Alerting Suite', quantity: 1, rate: 400.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-014',
      invoiceReference: 'PEND-102',
      invoiceDate: '2026-09-28',
      dueDate: '2026-10-28',
      description: 'Full-Stack Invoice Management Solution Phase 1',
      status: InvoiceStatus.Pending,
      discount: 100.0,
      taxRate: 0.1,
      paidAmount: 2000.0, // Partial payment
      customerIndex: 4, // Marcus
      items: [
        { name: 'Backend NestJS API Framework', quantity: 1, rate: 3500.0 },
        { name: 'Frontend React UI Dashboard', quantity: 1, rate: 3000.0 },
      ],
    },
    {
      invoiceNumber: 'INV-2026-015',
      invoiceReference: 'NET30-01',
      invoiceDate: '2026-09-22',
      dueDate: '2026-10-22',
      description: 'Data Analytics & PowerBI Reporting Integration',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 0, // Unpaid active
      customerIndex: 5, // Amara
      items: [
        { name: 'ETL Pipeline Data Modeling', quantity: 1, rate: 2800.0 },
        {
          name: 'Executive Dashboard Visualization',
          quantity: 1,
          rate: 1700.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-016',
      invoiceReference: 'NET30-02',
      invoiceDate: '2026-09-25',
      dueDate: '2026-10-25',
      description: 'E-Commerce Payment Gateway Integration',
      status: InvoiceStatus.Pending,
      discount: 50.0,
      taxRate: 0.1,
      paidAmount: 1000.0,
      customerIndex: 6, // Hiroshi
      items: [
        {
          name: 'Stripe Webhooks & Checkout Integration',
          quantity: 1,
          rate: 2400.0,
        },
        {
          name: 'Apple Pay & Google Pay Mobile Checkout',
          quantity: 1,
          rate: 1200.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-017',
      invoiceReference: 'PO-77491',
      invoiceDate: '2026-09-30',
      dueDate: '2026-10-30',
      description: 'Technical Writing & API Documentation',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 7, // Chloe
      items: [
        {
          name: 'OpenAPI Swagger 3.0 Documentation',
          quantity: 1,
          rate: 1400.0,
        },
        {
          name: 'Developer Quick-Start Portal Guides',
          quantity: 1,
          rate: 1100.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-018',
      invoiceReference: 'PO-88210',
      invoiceDate: '2026-10-01',
      dueDate: '2026-11-01',
      description: 'Docker Containerization & Multi-Environment Setup',
      status: InvoiceStatus.Pending,
      discount: 80.0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 8, // Oliver
      items: [
        { name: 'Docker Compose Orchestration', quantity: 1, rate: 1600.0 },
        {
          name: 'Nginx Reverse Proxy & SSL Configuration',
          quantity: 1,
          rate: 900.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-019',
      invoiceReference: 'PO-99120',
      invoiceDate: '2026-10-01',
      dueDate: '2026-10-20',
      description: 'Performance Tuning & Memory Leak Auditing',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 800.0,
      customerIndex: 9, // Priya
      items: [
        {
          name: 'Heap Snapshot Analysis & V8 Diagnostics',
          quantity: 8,
          rate: 220.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-020',
      invoiceReference: 'PO-33019',
      invoiceDate: '2026-10-02',
      dueDate: '2026-11-02',
      description: 'Automated E2E Testing Suite Implementation',
      status: InvoiceStatus.Pending,
      discount: 100.0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 10, // Lucas
      items: [
        {
          name: 'Playwright Test Automation Architecture',
          quantity: 1,
          rate: 3100.0,
        },
        {
          name: 'Cross-Browser Visual Regression Testing',
          quantity: 1,
          rate: 1400.0,
        },
      ],
    },

    // --- Overdue Invoices (Stored as Pending in DB, Past Due Date relative to 2026-10-02, Balance > 0) ---
    {
      invoiceNumber: 'INV-2026-021',
      invoiceReference: 'OVERDUE-01',
      invoiceDate: '2026-07-01',
      dueDate: '2026-08-01', // Past due date
      description: 'Custom CRM Dashboard Integration (Overdue Notice)',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 500.0, // Partial payment, balance remaining
      customerIndex: 1, // Sarah
      items: [
        { name: 'Salesforce API Two-Way Sync', quantity: 1, rate: 2900.0 },
        {
          name: 'Webhook Event Listener Integration',
          quantity: 1,
          rate: 1100.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-022',
      invoiceReference: 'OVERDUE-02',
      invoiceDate: '2026-07-15',
      dueDate: '2026-08-15', // Past due date
      description: 'Legacy Data Migration & SQL Normalization',
      status: InvoiceStatus.Pending,
      discount: 100.0,
      taxRate: 0.1,
      paidAmount: 0, // Zero payment
      customerIndex: 2, // David
      items: [
        {
          name: 'MySQL to PostgreSQL Schema Migration',
          quantity: 1,
          rate: 3500.0,
        },
        {
          name: 'ETL Validation & Checksum Scripts',
          quantity: 1,
          rate: 1500.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-023',
      invoiceReference: 'OVERDUE-03',
      invoiceDate: '2026-08-01',
      dueDate: '2026-09-01', // Past due date
      description: 'Single Sign-On (SSO) SAML 2.0 Integration',
      status: InvoiceStatus.Pending,
      discount: 50.0,
      taxRate: 0.1,
      paidAmount: 1200.0,
      customerIndex: 3, // Elena
      items: [
        {
          name: 'Okta & Azure AD Identity Provider Setup',
          quantity: 1,
          rate: 2800.0,
        },
        {
          name: 'RBAC Permission Matrix Implementation',
          quantity: 1,
          rate: 1200.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-024',
      invoiceReference: 'OVERDUE-04',
      invoiceDate: '2026-08-10',
      dueDate: '2026-09-10', // Past due date
      description: 'Mobile Push Notifications Architecture',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 4, // Marcus
      items: [
        {
          name: 'Firebase Cloud Messaging (FCM) Integration',
          quantity: 1,
          rate: 1800.0,
        },
        {
          name: 'Apple Push Notification Service (APNs)',
          quantity: 1,
          rate: 1600.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-025',
      invoiceReference: 'OVERDUE-05',
      invoiceDate: '2026-08-20',
      dueDate: '2026-09-20', // Past due date
      description: 'Financial Transaction Export Service (CSV/PDF)',
      status: InvoiceStatus.Pending,
      discount: 40.0,
      taxRate: 0.1,
      paidAmount: 1500.0,
      customerIndex: 5, // Amara
      items: [
        {
          name: 'Automated PDF Generation Pipeline',
          quantity: 1,
          rate: 2100.0,
        },
        {
          name: 'Async Background Job Queue (BullMQ)',
          quantity: 1,
          rate: 1400.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-026',
      invoiceReference: 'OVERDUE-06',
      invoiceDate: '2026-08-25',
      dueDate: '2026-09-25', // Past due date
      description: 'Real-Time WebSocket Chat Infrastructure',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 600.0,
      customerIndex: 6, // Hiroshi
      items: [
        {
          name: 'Socket.io Gateway with Redis PubSub',
          quantity: 1,
          rate: 2600.0,
        },
        {
          name: 'Message History Pagination & Retention',
          quantity: 1,
          rate: 1000.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-027',
      invoiceReference: 'OVERDUE-07',
      invoiceDate: '2026-08-30',
      dueDate: '2026-09-30', // Past due date
      description: 'GraphQL API Gateway & Federation',
      status: InvoiceStatus.Pending,
      discount: 100.0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 7, // Chloe
      items: [
        { name: 'Apollo Federation Gateway Setup', quantity: 1, rate: 3600.0 },
        {
          name: 'Schema Stitching & DataLoader Batching',
          quantity: 1,
          rate: 1800.0,
        },
      ],
    },

    // --- Additional Varied Invoices for Rich Search & Filtering ---
    {
      invoiceNumber: 'INV-2026-028',
      invoiceReference: 'AUDIT-881',
      invoiceDate: '2026-09-10',
      dueDate: '2026-10-10',
      description: 'Accessibility (WCAG 2.1 AA) Compliance Audit',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 1000.0,
      customerIndex: 8, // Oliver
      items: [
        {
          name: 'Screen Reader & Keyboard Nav Remediation',
          quantity: 12,
          rate: 150.0,
        },
        {
          name: 'Color Contrast & ARIA Markup Optimization',
          quantity: 1,
          rate: 800.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-029',
      invoiceReference: 'PAID-2026-29',
      invoiceDate: '2026-09-05',
      dueDate: '2026-09-25',
      description: 'Dark Mode Theme Implementation & Tailwind Styling',
      status: InvoiceStatus.Paid,
      discount: 50.0,
      taxRate: 0.1,
      customerIndex: 9, // Priya
      items: [
        {
          name: 'Tailwind CSS Design Tokens Configuration',
          quantity: 1,
          rate: 1200.0,
        },
        {
          name: 'Component Palette Responsive Review',
          quantity: 1,
          rate: 900.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-030',
      invoiceReference: 'DRAFT-030',
      invoiceDate: '2026-10-02',
      dueDate: '2026-11-02',
      description: 'AI-Powered Invoice OCR Data Extraction Module',
      status: InvoiceStatus.Draft,
      discount: 150.0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 10, // Lucas
      items: [
        {
          name: 'Gemini Vision Document Parser Pipeline',
          quantity: 1,
          rate: 4200.0,
        },
        {
          name: 'Structured JSON Schema Output Validation',
          quantity: 1,
          rate: 1800.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-031',
      invoiceReference: 'PAID-031',
      invoiceDate: '2026-06-20',
      dueDate: '2026-07-20',
      description: 'SSL Certificate Renewal & Automated ACME Bot',
      status: InvoiceStatus.Paid,
      discount: 0,
      taxRate: 0.1,
      customerIndex: 1, // Sarah
      items: [
        {
          name: 'Wildcard Domain SSL Renewal & Nginx Deploy',
          quantity: 1,
          rate: 450.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-032',
      invoiceReference: 'PAID-032',
      invoiceDate: '2026-08-10',
      dueDate: '2026-09-10',
      description: 'CloudFront CDN Multi-Region Edge Caching',
      status: InvoiceStatus.Paid,
      discount: 25.0,
      taxRate: 0.1,
      customerIndex: 2, // David
      items: [
        {
          name: 'CDN Cache Invalidation Lambda@Edge',
          quantity: 1,
          rate: 1350.0,
        },
        {
          name: 'Static Asset Compression (Brotli/Gzip)',
          quantity: 1,
          rate: 600.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-033',
      invoiceReference: 'OVERDUE-08',
      invoiceDate: '2026-08-15',
      dueDate: '2026-09-15',
      description: 'Disaster Recovery & Hot Standby Replication',
      status: InvoiceStatus.Pending,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 1000.0,
      customerIndex: 3, // Elena
      items: [
        {
          name: 'Cross-Region RDS Read Replica Setup',
          quantity: 1,
          rate: 2500.0,
        },
        {
          name: 'Failover Automation & Health Probes',
          quantity: 1,
          rate: 1500.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-034',
      invoiceReference: 'PEND-034',
      invoiceDate: '2026-09-29',
      dueDate: '2026-10-29',
      description: 'Kubernetes Pod Autoscaling (HPA) & Load Testing',
      status: InvoiceStatus.Pending,
      discount: 50.0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 4, // Marcus
      items: [
        {
          name: 'K6 Distributed Load Testing Scenarios',
          quantity: 1,
          rate: 2100.0,
        },
        {
          name: 'Cluster Metrics Server & HPA Tuning',
          quantity: 1,
          rate: 1200.0,
        },
      ],
    },
    {
      invoiceNumber: 'INV-2026-035',
      invoiceReference: 'DRAFT-035',
      invoiceDate: '2026-10-02',
      dueDate: '2026-10-31',
      description: 'Code Quality Governance & SonarQube Integration',
      status: InvoiceStatus.Draft,
      discount: 0,
      taxRate: 0.1,
      paidAmount: 0,
      customerIndex: 5, // Amara
      items: [
        {
          name: 'SonarQube Quality Gate Automation',
          quantity: 1,
          rate: 1600.0,
        },
        {
          name: 'Technical Debt Remediation Roadmap',
          quantity: 1,
          rate: 900.0,
        },
      ],
    },
  ];

  for (const inv of diverseInvoices) {
    // 1. Calculate financial totals
    const invoiceSubTotal = inv.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0,
    );
    const totalDiscount = inv.discount ?? 0;
    const discountedTotal = Math.max(0, invoiceSubTotal - totalDiscount);
    const taxRate = inv.taxRate ?? 0.1;
    const totalTax = Math.round(discountedTotal * taxRate * 100) / 100;
    const totalAmount = Math.round((discountedTotal + totalTax) * 100) / 100;

    let totalPaid = 0;
    if (inv.status === InvoiceStatus.Paid) {
      totalPaid = totalAmount;
    } else if (inv.paidAmount !== undefined) {
      totalPaid = Math.min(totalAmount, inv.paidAmount);
    }
    const balanceAmount =
      Math.round(Math.max(0, totalAmount - totalPaid) * 100) / 100;

    const customer = createdCustomers[inv.customerIndex];

    await prisma.invoice.create({
      data: {
        invoiceNumber: inv.invoiceNumber,
        invoiceReference: inv.invoiceReference,
        invoiceDate: new Date(inv.invoiceDate),
        dueDate: new Date(inv.dueDate),
        currency: inv.currency ?? 'AUD',
        currencySymbol: inv.currencySymbol ?? 'AU$',
        description: inv.description,
        status: inv.status,
        invoiceSubTotal,
        totalDiscount,
        totalTax,
        totalAmount,
        totalPaid,
        balanceAmount,
        createdBy: reviewerUser.id,
        customerId: customer.id,
        createdAt: inv.createdAt
          ? new Date(inv.createdAt)
          : new Date(inv.invoiceDate),
        items: {
          create: inv.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            rate: it.rate,
          })),
        },
      },
    });
  }

  const invoiceCount = await prisma.invoice.count();
  const customerCount = await prisma.customer.count();
  const userCount = await prisma.user.count();
  const itemCount = await prisma.invoiceItem.count();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SimpleInvoice Seed Summary:');
  console.log(`   Users:        ${userCount}`);
  console.log(`   Customers:    ${customerCount}`);
  console.log(`   Invoices:     ${invoiceCount}`);
  console.log(`   Line Items:   ${itemCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error executing seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
