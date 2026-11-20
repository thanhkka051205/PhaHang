/**
 * Test Suite cho apiClient Auth & User Role với fetch mock
 */
import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { API_CONFIG } from '../js/config/apiConfig.js';
import { apiClient, tokenManager } from '../js/services/apiClient.js';

const originalFetch = globalThis.fetch;

function mockJsonResponse(status, body) {
  const textBody = body === null || body === undefined
    ? ''
    : (typeof body === 'string' ? body : JSON.stringify(body));
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return textBody;
    }
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  localStorage.clear();
});

test('apiClient.login: unwrap RestResponse<ResLoginDTO> và lưu token đúng scope client/admin', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      return mockJsonResponse(200, {
        statusCode: 200,
        message: 'Đăng nhập thành công',
        data: {
          accessToken: 'client-jwt-123',
          user: {
            userId: 10,
            fullName: 'Khách Hàng A',
            email: 'khach@gmail.com',
            role: 'ROLE_CUSTOM',
            status: true
          }
        }
      });
    }
    return mockJsonResponse(200, {
      statusCode: 200,
      message: 'Đăng nhập thành công',
      data: {
        accessToken: 'admin-jwt-456',
        user: {
          userId: 1,
          fullName: 'Admin A',
          email: 'admin@phahang.vn',
          role: 'ROLE_ADMIN',
          status: true
        }
      }
    });
  };

  const clientRes = await apiClient.login('khach@gmail.com', '12345678', 'client');
  assert.equal(clientRes.accessToken, 'client-jwt-123');
  assert.equal(clientRes.user.role, 'CUSTOMER');
  assert.equal(tokenManager.get('client'), 'client-jwt-123');
  assert.equal(tokenManager.get('admin'), null);

  const adminRes = await apiClient.login('admin@phahang.vn', 'admin1234', 'admin');
  assert.equal(adminRes.accessToken, 'admin-jwt-456');
  assert.equal(adminRes.user.role, 'ADMIN');
  assert.equal(tokenManager.get('admin'), 'admin-jwt-456');
  assert.equal(tokenManager.get('client'), 'client-jwt-123');

  assert.equal(calls[0].url, `${API_CONFIG.BASE_URL}/auth/login`);
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers['Authorization'], undefined);
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    username: 'khach@gmail.com',
    password: '12345678'
  });
});

test('apiClient.register: gọi POST /auth/register, unwrap RestResponse và chuẩn hóa user', async () => {
  let captured = null;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return mockJsonResponse(201, {
      statusCode: 201,
      message: 'Đăng ký thành công',
      data: {
        userId: 25,
        fullName: 'Nguyễn Văn Mới',
        email: 'moi@gmail.com',
        role: 'ROLE_CUSTOM',
        status: true
      }
    });
  };

  const user = await apiClient.register({
    fullName: 'Nguyễn Văn Mới',
    email: 'moi@gmail.com',
    password: 'Password123'
  });

  assert.equal(captured.url, `${API_CONFIG.BASE_URL}/auth/register`);
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers['Authorization'], undefined);
  assert.deepEqual(JSON.parse(captured.options.body), {
    fullName: 'Nguyễn Văn Mới',
    email: 'moi@gmail.com',
    password: 'Password123'
  });
  assert.equal(user.id, 25);
  assert.equal(user.role, 'CUSTOMER');
  assert.equal(user.isActive, true);
});

test('apiClient.updateUserRole: gọi PATCH /users/{id}/role bằng token admin', async () => {
  tokenManager.set('client-token-should-not-use', 'client');
  tokenManager.set('admin-token-valid', 'admin');

  let captured = null;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return mockJsonResponse(200, {
      statusCode: 200,
      message: 'Cập nhật quyền thành công',
      data: {
        userId: 7,
        fullName: 'Nhân Viên 7',
        email: 'nv7@phahang.vn',
        role: 'ROLE_STAFF',
        status: true
      }
    });
  };

  const updated = await apiClient.updateUserRole(7, 'staff');
  assert.equal(captured.url, `${API_CONFIG.BASE_URL}/users/7/role`);
  assert.equal(captured.options.method, 'PATCH');
  assert.equal(captured.options.headers['Authorization'], 'Bearer admin-token-valid');
  assert.deepEqual(JSON.parse(captured.options.body), { role: 'STAFF' });
  assert.equal(updated.role, 'STAFF');
});

test('apiClient: lỗi 401 xóa đúng token theo scope và giữ scope còn lại', async () => {
  tokenManager.set('client-tok', 'client');
  tokenManager.set('admin-tok', 'admin');

  globalThis.fetch = async () => mockJsonResponse(401, { message: 'Unauthorized' });

  await assert.rejects(
    () => apiClient.getUsers(),
    (err) => err.status === 401
  );
  assert.equal(tokenManager.get('admin'), null);
  assert.equal(tokenManager.get('client'), 'client-tok');

  tokenManager.set('admin-tok-2', 'admin');
  await assert.rejects(
    () => apiClient.getAddresses(),
    (err) => err.status === 401
  );
  assert.equal(tokenManager.get('client'), null);
  assert.equal(tokenManager.get('admin'), 'admin-tok-2');
});

test('apiClient: lỗi 403 giữ nguyên token và ném lỗi quyền', async () => {
  tokenManager.set('admin-tok', 'admin');
  globalThis.fetch = async () => mockJsonResponse(403, { message: 'Forbidden' });

  await assert.rejects(
    () => apiClient.updateUserRole(7, 'ADMIN'),
    (err) => err.status === 403 && err.message.includes('quyền')
  );
  assert.equal(tokenManager.get('admin'), 'admin-tok');
});

test('apiClient: lỗi 400 parse JSON message từ Backend', async () => {
  globalThis.fetch = async () => mockJsonResponse(400, {
    statusCode: 400,
    message: 'Email đã được sử dụng trong hệ thống'
  });

  await assert.rejects(
    () => apiClient.register({
      fullName: 'Test',
      email: 'dup@gmail.com',
      password: 'Password123'
    }),
    (err) => err.status === 400 && err.message === 'Email đã được sử dụng trong hệ thống'
  );
});

test('apiClient: network error gắn isNetworkError = true', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };

  await assert.rejects(
    () => apiClient.login('a@b.com', '12345678', 'client'),
    (err) => err.isNetworkError === true && err instanceof TypeError
  );
});
