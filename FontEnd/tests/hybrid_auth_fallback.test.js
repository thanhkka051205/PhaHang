/**
 * Test Suite cho Hybrid Auth & Fallback trong authStore (USE_API = true + mockService fallback)
 */
import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { API_CONFIG } from '../js/config/apiConfig.js';
import { tokenManager } from '../js/services/apiClient.js';
import { authStore } from '../js/stores/authStore.js';

const originalFetch = globalThis.fetch;
const originalUseApi = API_CONFIG.USE_API;
const originalFallback = API_CONFIG.FALLBACK_TO_MOCK;
const originalAuthDomain = API_CONFIG.DOMAINS.auth;

function mockJsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(body);
    }
  };
}

beforeEach(() => {
  authStore.logoutClient();
  authStore.logoutAdmin();
  localStorage.clear();
  API_CONFIG.USE_API = true;
  API_CONFIG.FALLBACK_TO_MOCK = true;
  API_CONFIG.DOMAINS.auth = 'hybrid';
});

afterEach(() => {
  authStore.logoutClient();
  authStore.logoutAdmin();
  globalThis.fetch = originalFetch;
  API_CONFIG.USE_API = originalUseApi;
  API_CONFIG.FALLBACK_TO_MOCK = originalFallback;
  API_CONFIG.DOMAINS.auth = originalAuthDomain;
  localStorage.clear();
});

test('authStore (USE_API = true): loginClient, registerClient (gộp phone + agreedPrivacyPolicy), loginAdmin', async () => {
  globalThis.fetch = async (url) => {
    if (url.endsWith('/auth/login')) {
      return mockJsonResponse(200, {
        statusCode: 200,
        data: {
          accessToken: 'jwt-client-1',
          user: {
            userId: 101,
            fullName: 'Khách BE',
            email: 'khachbe@gmail.com',
            role: 'ROLE_CUSTOM',
            status: true
          }
        }
      });
    }
    if (url.endsWith('/auth/register')) {
      return mockJsonResponse(201, {
        statusCode: 201,
        data: {
          userId: 102,
          fullName: 'Đăng Ký BE',
          email: 'regbe@gmail.com',
          role: 'ROLE_CUSTOM',
          status: true
        }
      });
    }
    throw new Error(`Unexpected URL: ${url}`);
  };

  const loggedClient = await authStore.loginClient('khachbe@gmail.com', '12345678');
  assert.equal(loggedClient.role, 'CUSTOMER');
  assert.equal(tokenManager.get('client'), 'jwt-client-1');
  assert.equal(authStore.getClientUser().email, 'khachbe@gmail.com');

  const registered = await authStore.registerClient({
    fullName: 'Đăng Ký BE',
    email: 'regbe@gmail.com',
    password: 'Password123',
    phone: '0909111222',
    agreedPrivacyPolicy: true
  });
  assert.equal(registered.id, 102);
  assert.equal(registered.phone, '0909111222');
  assert.equal(registered.agreedPrivacyPolicy, true);
  assert.equal(authStore.getClientUser().phone, '0909111222');

  globalThis.fetch = async () => mockJsonResponse(200, {
    statusCode: 200,
    data: {
      accessToken: 'jwt-admin-1',
      user: {
        userId: 1,
        fullName: 'Admin BE',
        email: 'admin@phahang.vn',
        role: 'ROLE_ADMIN',
        status: true
      }
    }
  });

  const admin = await authStore.loginAdmin('admin@phahang.vn', 'admin1234');
  assert.equal(admin.role, 'ADMIN');
  assert.equal(tokenManager.get('admin'), 'jwt-admin-1');
  assert.equal(authStore.getAdminUser().email, 'admin@phahang.vn');
});

test('authStore fallback mockService khi isNetworkError = true và FALLBACK_TO_MOCK = true', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Network unreachable');
  };

  const clientUser = await authStore.loginClient('khachhang@gmail.com', '123456');
  assert.equal(clientUser.email, 'khachhang@gmail.com');
  assert.equal(clientUser.role, 'CUSTOMER');
  assert.equal(authStore.getClientUser().email, 'khachhang@gmail.com');

  const newUser = await authStore.registerClient({
    fullName: 'Fallback User',
    email: 'fallback.user@gmail.com',
    phone: '0911222333',
    password: 'Password123',
    agreedPrivacyPolicy: true
  });
  assert.equal(newUser.email, 'fallback.user@gmail.com');
  assert.equal(newUser.phone, '0911222333');
  assert.equal(newUser.role, 'CUSTOMER');
  assert.equal(newUser.isActive, true);

  const adminUser = await authStore.loginAdmin('admin@phahang.vn', '123456');
  assert.equal(adminUser.role, 'ADMIN');
  assert.equal(authStore.getAdminUser().email, 'admin@phahang.vn');
});

test('authStore KHÔNG fallback sang mockService khi BE trả lỗi 401 hoặc 400', async () => {
  globalThis.fetch = async () => mockJsonResponse(401, { message: 'Unauthorized' });

  await assert.rejects(
    () => authStore.loginClient('khachhang@gmail.com', '123456'),
    (err) => err.status === 401
  );
  assert.equal(authStore.getClientUser(), null);

  await assert.rejects(
    () => authStore.loginAdmin('admin@phahang.vn', '123456'),
    (err) => err.status === 401
  );
  assert.equal(authStore.getAdminUser(), null);

  globalThis.fetch = async () => mockJsonResponse(400, {
    statusCode: 400,
    message: 'Email đã tồn tại trên hệ thống'
  });

  await assert.rejects(
    () => authStore.registerClient({
      fullName: 'Dup User',
      email: 'khachhang@gmail.com',
      phone: '0912345678',
      password: 'Password123',
      agreedPrivacyPolicy: true
    }),
    (err) => err.status === 400 && err.message === 'Email đã tồn tại trên hệ thống'
  );
});

test('authStore.loginAdmin: chặn tài khoản ROLE_CUSTOM / CUSTOMER và xóa token admin', async () => {
  globalThis.fetch = async () => mockJsonResponse(200, {
    statusCode: 200,
    data: {
      accessToken: 'jwt-customer-trying-admin',
      user: {
        userId: 50,
        fullName: 'Khách Thường',
        email: 'khach@gmail.com',
        role: 'ROLE_CUSTOM',
        status: true
      }
    }
  });

  await assert.rejects(
    () => authStore.loginAdmin('khach@gmail.com', '12345678'),
    (err) => err.message.includes('quyền')
  );
  assert.equal(tokenManager.get('admin'), null);
  assert.equal(authStore.getAdminUser(), null);
});

test('authStore.logoutClient: không ảnh hưởng token và session của admin', async () => {
  globalThis.fetch = async (url) => {
    if (url.endsWith('/auth/login')) {
      return mockJsonResponse(200, {
        statusCode: 200,
        data: {
          accessToken: 'jwt-shared-test',
          user: {
            userId: 1,
            fullName: 'Admin',
            email: 'admin@phahang.vn',
            role: 'ROLE_ADMIN',
            status: true
          }
        }
      });
    }
    throw new Error(`Unexpected URL: ${url}`);
  };

  await authStore.loginAdmin('admin@phahang.vn', '12345678');

  globalThis.fetch = async () => mockJsonResponse(200, {
    statusCode: 200,
    data: {
      accessToken: 'jwt-client-only',
      user: {
        userId: 2,
        fullName: 'Client',
        email: 'client@gmail.com',
        role: 'ROLE_CUSTOM',
        status: true
      }
    }
  });

  await authStore.loginClient('client@gmail.com', '12345678');
  assert.equal(tokenManager.get('client'), 'jwt-client-only');
  assert.equal(tokenManager.get('admin'), 'jwt-shared-test');

  authStore.logoutClient();

  assert.equal(tokenManager.get('client'), null);
  assert.equal(authStore.getClientUser(), null);
  assert.equal(tokenManager.get('admin'), 'jwt-shared-test');
  assert.equal(authStore.getAdminUser().email, 'admin@phahang.vn');
});
