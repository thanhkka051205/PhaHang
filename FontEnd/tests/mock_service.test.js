import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mockService, initMockDB } from '../js/services/mockService.js';

test('Nghiệp vụ Mock Service LocalStorage', async (t) => {
  initMockDB();

  await t.test('Nạp đủ 5 ngành hàng chính (REQ-001)', async () => {
    const cats = await mockService.getCategories();
    const parentCats = cats.filter(c => c.parentId === null);
    assert.equal(parentCats.length, 5);
    const names = parentCats.map(c => c.name);
    assert.ok(names.includes('Ti vi'));
    assert.ok(names.includes('Điều hòa'));
    assert.ok(names.includes('Tủ lạnh'));
    assert.ok(names.includes('Quạt'));
    assert.ok(names.includes('Nồi cơm điện'));
  });

  await t.test('Lọc sản phẩm theo danh mục và phân trang 12 sp/trang (UI-10)', async () => {
    const res = await mockService.getProducts({ categoryId: 1, limit: 12 });
    assert.ok(res.items.length > 0);
    assert.equal(res.limit, 12);
    assert.ok(res.items.every(p => p.categoryId === 1 || p.categoryId === 6 || p.categoryId === 7));
  });

  await t.test('Lọc sản phẩm theo thương hiệu và khoảng giá', async () => {
    const res = await mockService.getProducts({ brand: 'Samsung', minPrice: 5000000 });
    assert.ok(res.items.length > 0);
    assert.ok(res.items.every(p => p.brand === 'Samsung'));
    assert.ok(res.items.every(p => Math.min(...p.variants.map(v => v.price)) >= 5000000));
  });

  await t.test('Áp dụng mã giảm giá voucher (PHAHANG50K)', async () => {
    const subtotal = 10000000;
    const res = await mockService.applyCoupon('PHAHANG50K', subtotal);
    assert.equal(res.discountAmount, 50000);
    assert.equal(res.finalTotal, 9950000);
  });

  await t.test('Tạo đơn hàng mới thành công (UI-08)', async () => {
    const orderData = {
      userId: 3,
      receiverName: 'Khách hàng Test',
      receiverPhone: '0988111222',
      shipAddress: 'Hà Nội',
      paymentMethod: 'COD',
      paymentStatus: 'UNPAID',
      discountAmount: 0,
      totalAmount: 9890000,
      items: [
        {
          id: 1,
          variantId: 101,
          productName: 'Smart Tivi Samsung',
          variantInfo: '55 inch',
          quantity: 1,
          unitPrice: 9890000
        }
      ]
    };

    const newOrder = await mockService.createOrder(orderData);
    assert.ok(newOrder.id > 0);
    assert.ok(newOrder.orderCode.startsWith('PH-'));
    assert.equal(newOrder.receiverName, 'Khách hàng Test');

    const fetched = await mockService.getOrderByCode(newOrder.orderCode);
    assert.equal(fetched.id, newOrder.id);
  });

  await t.test('Lấy báo cáo tổng quan Dashboard', async () => {
    const summary = await mockService.getDashboardSummary();
    assert.ok(summary.totalProducts >= 18);
    assert.ok(summary.totalCustomers >= 1);
    assert.ok(summary.totalRevenue >= 0);
  });
});
