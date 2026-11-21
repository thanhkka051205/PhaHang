import { describe, it, expect } from 'vitest';
import { calculateInstallment } from '../src/utils/installment';

describe('Installment Calculator (Tiện ích tính trả góp 0%)', () => {
  it('calculates 0% down payment correctly for 6 months', () => {
    const price = 24000000;
    const plan = calculateInstallment(price, 6, 0);

    expect(plan.downPaymentAmount).toBe(0);
    expect(plan.loanAmount).toBe(24000000);
    expect(plan.monthlyPayment).toBe(4000000);
    expect(plan.totalPayment).toBe(24000000);
  });

  it('calculates 20% down payment correctly for 12 months', () => {
    const price = 30000000;
    const plan = calculateInstallment(price, 12, 20);

    expect(plan.downPaymentAmount).toBe(6000000);
    expect(plan.loanAmount).toBe(24000000);
    expect(plan.monthlyPayment).toBe(2000000);
    expect(plan.totalPayment).toBe(30000000);
  });

  it('handles rounding to thousands cleanly for uneven price', () => {
    const price = 19990000;
    const plan = calculateInstallment(price, 3, 30);

    expect(plan.downPaymentAmount).toBe(5997000);
    expect(plan.loanAmount).toBe(13993000);
    // 13993000 / 3 = 4664333.33 -> làm tròn lên hàng nghìn = 4665000
    expect(plan.monthlyPayment).toBe(4665000);
  });
});
