/**
 * Bảo vệ route và phân quyền Client vs Admin (DEC-001, UI-09)
 */
import { authStore } from '../stores/authStore.js';

/**
 * Yêu cầu quyền Quản trị (ADMIN hoặc STAFF) để vào trang quản trị
 */
export function requireAdmin() {
  const user = authStore.getAdminUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    window.location.replace('/admin/login.html');
    return false;
  }
  return true;
}

/**
 * Yêu cầu quyền Khách hàng đã đăng nhập để vào xem đơn hàng cá nhân
 */
export function requireCustomer() {
  const user = authStore.getClientUser();
  if (!user) {
    window.location.replace('/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    return false;
  }
  return true;
}
