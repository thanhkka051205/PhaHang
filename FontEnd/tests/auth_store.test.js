import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { authStore } from '../js/stores/authStore.js';
import { initMockDB } from '../js/services/mockService.js';

test('Phân tách và xác thực tài khoản Client vs Admin (DEC-001, UI-09)', async (t) => {
  initMockDB();
  authStore.logoutClient();
  authStore.logoutAdmin();

  await t.test('Đăng nhập khách hàng thành công', async () => {
    const user = await authStore.loginClient('khachhang@gmail.com', '123456');
    assert.equal(user.email, 'khachhang@gmail.com');
    assert.equal(user.role, 'CUSTOMER');
    assert.equal(authStore.getClientUser()?.email, 'khachhang@gmail.com');
  });

  await t.test('Khách hàng không thể đăng nhập vào cổng Quản trị', async () => {
    await assert.rejects(
      async () => {
        await authStore.loginAdmin('khachhang@gmail.com', '123456');
      },
      { message: 'Bạn không có quyền truy cập cổng Quản trị.' }
    );
  });

  await t.test('Admin và Staff đăng nhập thành công vào cổng Quản trị', async () => {
    const admin = await authStore.loginAdmin('admin@phahang.vn', '123456');
    assert.equal(admin.role, 'ADMIN');
    assert.equal(authStore.getAdminUser()?.email, 'admin@phahang.vn');

    // Phiên client và admin độc lập hoàn toàn
    assert.equal(authStore.getClientUser()?.email, 'khachhang@gmail.com');
  });

  await t.test('Đăng xuất client không ảnh hưởng đến phiên admin', () => {
    authStore.logoutClient();
    assert.equal(authStore.getClientUser(), null);
    assert.equal(authStore.getAdminUser()?.email, 'admin@phahang.vn');
  });
});
