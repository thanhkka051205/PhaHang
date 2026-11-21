import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { authStore } from '../js/stores/authStore.js';
import { mockService, initMockDB } from '../js/services/mockService.js';

test('Luồng Đăng ký & Đăng nhập Khách Hàng (FR-01, DEC-001, UI-05)', async (t) => {
  initMockDB();
  authStore.logoutClient();

  await t.test('Đăng ký tài khoản khách hàng mới thành công', async () => {
    const newUser = await authStore.registerClient({
      fullName: 'Nguyễn Văn Minh',
      email: 'minh.nguyen@gmail.com',
      phone: '0987654321',
      password: 'password123'
    });

    assert.equal(newUser.fullName, 'Nguyễn Văn Minh');
    assert.equal(newUser.email, 'minh.nguyen@gmail.com');
    assert.equal(newUser.role, 'CUSTOMER');
    assert.equal(newUser.isActive, true);
    assert.equal(authStore.getClientUser()?.email, 'minh.nguyen@gmail.com');

    // Kiểm tra tài khoản đã thực sự được lưu vào mock DB
    const allUsers = await mockService.getUsers();
    const saved = allUsers.find(u => u.email === 'minh.nguyen@gmail.com');
    assert.ok(saved);
  });

  await t.test('Chặn đăng ký trùng địa chỉ email', async () => {
    await assert.rejects(
      async () => {
        await mockService.registerUser({
          fullName: 'Người khác',
          email: 'minh.nguyen@gmail.com',
          phone: '0911223344',
          password: 'password123'
        });
      },
      { message: 'Địa chỉ email này đã được đăng ký tài khoản.' }
    );
  });

  await t.test('Chặn đăng ký trùng số điện thoại', async () => {
    await assert.rejects(
      async () => {
        await mockService.registerUser({
          fullName: 'Người khác',
          email: 'khac@gmail.com',
          phone: '0987654321',
          password: 'password123'
        });
      },
      { message: 'Số điện thoại này đã được đăng ký tài khoản.' }
    );
  });

  await t.test('Chặn đăng ký mật khẩu dưới 8 ký tự (FR-01.4)', async () => {
    await assert.rejects(
      async () => {
        await mockService.registerUser({
          fullName: 'Người yếu pass',
          email: 'shortpass@gmail.com',
          phone: '0933445566',
          password: '123'
        });
      },
      { message: 'Mật khẩu bắt buộc phải có tối thiểu 8 ký tự (FR-01.4).' }
    );
  });

  await t.test('Đăng nhập thất bại khi sai email hoặc mật khẩu (Bắt buộc ném lỗi)', async () => {
    authStore.logoutClient();
    await assert.rejects(
      async () => {
        await authStore.loginClient('minh.nguyen@gmail.com', 'sai_mat_khau');
      },
      { message: 'Email hoặc mật khẩu không chính xác.' }
    );
    assert.equal(authStore.getClientUser(), null);
  });

  await t.test('Đăng nhập thành công với tài khoản vừa tạo', async () => {
    authStore.logoutClient();
    const user = await authStore.loginClient('minh.nguyen@gmail.com', 'password123');
    assert.equal(user.email, 'minh.nguyen@gmail.com');
    assert.equal(authStore.getClientUser()?.email, 'minh.nguyen@gmail.com');
  });
});
