import { describe, it, expect } from 'vitest';
import { calculateDiscount } from '../src/utils/coupon';
import type { Coupon } from '../src/types';

describe('Coupon Discount Calculation (BR-04)', () => {
  const activePercentCoupon: Coupon = {
    id: 1,
    code: 'SALE10',
    discountType: 'PERCENT',
    discountValue: 10, // 10%
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true
  };

  const activeAmountCoupon: Coupon = {
    id: 2,
    code: 'TTM200K',
    discountType: 'AMOUNT',
    discountValue: 200000, // 200k
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true
  };

  const inactiveCoupon: Coupon = {
    id: 3,
    code: 'INACTIVE',
    discountType: 'AMOUNT',
    discountValue: 500000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: false
  };

  const expiredCoupon: Coupon = {
    id: 4,
    code: 'EXPIRED',
    discountType: 'PERCENT',
    discountValue: 20,
    startDate: '2025-01-01',
    endDate: '2025-05-01',
    isActive: true
  };

  it('Tính đúng giảm giá theo phần trăm PERCENT', () => {
    // 10% của 20.000.000 = 2.000.000
    const discount = calculateDiscount(activePercentCoupon, 20000000);
    expect(discount).toBe(2000000);
  });

  it('Tính đúng giảm giá theo số tiền AMOUNT', () => {
    const discount = calculateDiscount(activeAmountCoupon, 15000000);
    expect(discount).toBe(200000);
  });

  it('Số tiền giảm không vượt quá giá trị đơn hàng (không bị âm)', () => {
    const discount = calculateDiscount(activeAmountCoupon, 100000);
    expect(discount).toBe(100000); // Tối đa bằng 100.000 ₫
  });

  it('Coupon không hoạt động (isActive = false) trả về 0', () => {
    const discount = calculateDiscount(inactiveCoupon, 20000000);
    expect(discount).toBe(0);
  });

  it('Coupon hết hạn sử dụng trả về 0', () => {
    const discount = calculateDiscount(expiredCoupon, 20000000);
    expect(discount).toBe(0);
  });
});
