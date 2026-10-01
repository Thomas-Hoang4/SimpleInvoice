import {
  calculateInvoiceAmounts,
  deriveInvoiceStatus,
  roundToTwoDecimals,
} from './invoice-calculations';

describe('Invoice Calculations Engine', () => {
  describe('roundToTwoDecimals', () => {
    it('should correctly round numbers to 2 decimal places without precision drift', () => {
      expect(roundToTwoDecimals(10.1234)).toBe(10.12);
      expect(roundToTwoDecimals(10.125)).toBe(10.13);
      expect(roundToTwoDecimals(10.0)).toBe(10);
      expect(roundToTwoDecimals(0.1 + 0.2)).toBe(0.3);
    });
  });

  describe('calculateInvoiceAmounts', () => {
    it('should calculate Appendix A canonical values accurately', () => {
      // Appendix A: quantity 2, rate 1000, tax 10%, discount 20
      const result = calculateInvoiceAmounts({
        quantity: 2,
        rate: 1000,
        taxPercent: 10,
        discount: 20,
        totalPaid: 1451.34,
      });

      expect(result.subTotal).toBe(2000.0);
      expect(result.taxAmount).toBe(200.0);
      expect(result.discount).toBe(20.0);
      expect(result.totalAmount).toBe(2180.0);
      expect(result.totalPaid).toBe(1451.34);
      expect(result.balanceAmount).toBe(728.66);
    });

    it('should apply defaults for tax (10%), discount (0), and totalPaid (0)', () => {
      const result = calculateInvoiceAmounts({
        quantity: 5,
        rate: 50,
      });

      expect(result.subTotal).toBe(250.0);
      expect(result.taxAmount).toBe(25.0); // 10% of 250
      expect(result.discount).toBe(0.0);
      expect(result.totalAmount).toBe(275.0);
      expect(result.totalPaid).toBe(0.0);
      expect(result.balanceAmount).toBe(275.0);
    });

    it('should correctly handle zero tax and zero discount', () => {
      const result = calculateInvoiceAmounts({
        quantity: 3,
        rate: 100,
        taxPercent: 0,
        discount: 0,
      });

      expect(result.subTotal).toBe(300.0);
      expect(result.taxAmount).toBe(0.0);
      expect(result.discount).toBe(0.0);
      expect(result.totalAmount).toBe(300.0);
      expect(result.balanceAmount).toBe(300.0);
    });

    it('should handle fractional quantities and rates with proper rounding', () => {
      const result = calculateInvoiceAmounts({
        quantity: 3,
        rate: 33.33,
        taxPercent: 8.5,
        discount: 5.5,
      });

      // 3 * 33.33 = 99.99
      // tax = 99.99 * 0.085 = 8.49915 -> 8.50
      // total = 99.99 + 8.50 - 5.5 = 102.99
      expect(result.subTotal).toBe(99.99);
      expect(result.taxAmount).toBe(8.5);
      expect(result.discount).toBe(5.5);
      expect(result.totalAmount).toBe(102.99);
      expect(result.balanceAmount).toBe(102.99);
    });
  });

  describe('deriveInvoiceStatus', () => {
    const today = new Date('2026-10-02T12:00:00.000Z');

    it('should return "Paid" regardless of due date when persisted status is Paid', () => {
      const pastDue = new Date('2026-09-01T00:00:00.000Z');
      expect(deriveInvoiceStatus('Paid', pastDue, today)).toBe('Paid');
    });

    it('should return "Overdue" when status is Pending and due date is in the past', () => {
      const pastDue = new Date('2026-10-01T00:00:00.000Z');
      expect(deriveInvoiceStatus('Pending', pastDue, today)).toBe('Overdue');
    });

    it('should return "Overdue" when status is Draft and due date is in the past', () => {
      const pastDue = new Date('2026-05-15T00:00:00.000Z');
      expect(deriveInvoiceStatus('Draft', pastDue, today)).toBe('Overdue');
    });

    it('should return persisted status when due date is today or in the future', () => {
      const sameDay = new Date('2026-10-02T00:00:00.000Z');
      const futureDate = new Date('2026-10-15T00:00:00.000Z');

      expect(deriveInvoiceStatus('Draft', sameDay, today)).toBe('Draft');
      expect(deriveInvoiceStatus('Pending', futureDate, today)).toBe('Pending');
    });
  });
});
