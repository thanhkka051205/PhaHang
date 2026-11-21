import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mockService, initMockDB } from '../js/services/mockService.js';

test('Bảo mật đơn hàng & Quyền riêng tư (NĐ 13/2023/NĐ-CP, DEC-001)', async (t) => {
  initMockDB();

  await t.test('getMyOrders chỉ trả về đơn hàng của tài khoản đang đăng nhập', async () => {
    const userKhach = { id: 3, fullName: 'Trần Thị Thu Khách', phone: '0912345678', email: 'khachhang@gmail.com' };
    const orders = await mockService.getMyOrders(userKhach);

    assert.ok(orders.length > 0);
    orders.forEach(o => {
      assert.ok(o.userId === 3 || o.receiverPhone === '0912345678');
    });

    const userKhac = { id: 999, fullName: 'Người lạ', phone: '0999999999', email: 'la@gmail.com' };
    const emptyOrders = await mockService.getMyOrders(userKhac);
    assert.equal(emptyOrders.length, 0);
  });

  await t.test('lookupGuestOrder yêu cầu đúng cả Mã đơn và Số điện thoại', async () => {
    const res = await mockService.lookupGuestOrder('PH-1001', '0912345678');
    assert.ok(res);
    assert.equal(res.id, 1);
    assert.equal(res.isGuestMasked, true);

    // Kiểm tra thông tin nhạy cảm (PII) đã được che mờ
    assert.ok(res.customerName.includes('***'));
    assert.ok(res.phone.includes('****'));
    assert.ok(res.address.includes('***'));
  });

  await t.test('lookupGuestOrder ném lỗi khi sai SĐT hoặc sai Mã đơn', async () => {
    await assert.rejects(
      async () => {
        await mockService.lookupGuestOrder('PH-1001', '0999999999');
      },
      { message: 'Không tìm thấy đơn hàng phù hợp với thông tin đã cung cấp.' }
    );

    await assert.rejects(
      async () => {
        await mockService.lookupGuestOrder('PH-9999', '0912345678');
      },
      { message: 'Không tìm thấy đơn hàng phù hợp với thông tin đã cung cấp.' }
    );
  });
});
