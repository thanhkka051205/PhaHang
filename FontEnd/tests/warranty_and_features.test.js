import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mockService, initMockDB } from '../js/services/mockService.js';

test('Hệ thống bảo hành điện tử & tính năng nâng cao (FR-12, UC-12, FR-07.5, BR-10)', async (t) => {
  initMockDB();

  await t.test('Tra cứu bảo hành theo Số Seri chính xác (FR-12, Wireframe Hình 14)', async () => {
    const results = await mockService.lookupWarranty('SN-SAM-55DU-849102');
    assert.ok(results.length >= 1, 'Phải tìm thấy ít nhất 1 hồ sơ');
    const w = results[0];
    assert.equal(w.serialNo, 'SN-SAM-55DU-849102');
    assert.ok(w.productName.includes('Samsung'));
    assert.equal(w.status, 'ACTIVE');
  });

  await t.test('Tra cứu bảo hành theo Số điện thoại khách hàng (NFR-02.3)', async () => {
    const results = await mockService.lookupWarranty('0912345678');
    assert.ok(results.length >= 1);
    assert.ok(results.every(w => w.customerPhone === '0912345678'));
  });

  await t.test('Tra cứu số seri không tồn tại trả về rỗng', async () => {
    const results = await mockService.lookupWarranty('SN-KHONG-TON-TAI-999');
    assert.deepEqual(results, []);
  });

  await t.test('Gán Số Seri cho đơn hàng và tự động tạo bảo hành điện tử (FR-07.5, BR-11)', async () => {
    // Gán seri cho đơn hàng 3, order item 3 (Quạt đứng)
    const testSerial = 'SN-SK-DR16-998877';
    const res = await mockService.assignSerialNumber(3, 3, testSerial);

    assert.ok(res.order);
    const item = res.order.items.find(it => it.id === 3);
    assert.equal(item.serialNo, testSerial);

    // Kiểm tra hồ sơ bảo hành mới sinh ra
    const warranty = res.warranty;
    assert.equal(warranty.serialNo, testSerial);
    assert.equal(warranty.status, 'ACTIVE');

    // Khách hàng có thể tra cứu ngay lập tức bằng số seri mới
    const lookup = await mockService.lookupWarranty(testSerial);
    assert.equal(lookup.length, 1);
    assert.equal(lookup[0].serialNo, testSerial);
  });

  await t.test('Cập nhật vai trò người dùng (FR-11 Role Select)', async () => {
    const user = await mockService.updateUserRole(3, 'STAFF');
    assert.equal(user.role, 'STAFF');

    // Chuyển lại về CUSTOMER
    const restored = await mockService.updateUserRole(3, 'CUSTOMER');
    assert.equal(restored.role, 'CUSTOMER');
  });

  await t.test('Thuật toán tính toán trả góp 0% (BR-10 Installment Modal)', () => {
    const price = 12000000;
    const percent = 30; // 30%
    const months = 12; // 12 tháng

    const downPayment = Math.round(price * (percent / 100)); // 3.600.000 ₫
    const loanAmount = price - downPayment; // 8.400.000 ₫
    const monthlyPayment = Math.round(loanAmount / months); // 700.000 ₫/tháng

    assert.equal(downPayment, 3600000);
    assert.equal(loanAmount, 8400000);
    assert.equal(monthlyPayment, 700000);
  });
});
