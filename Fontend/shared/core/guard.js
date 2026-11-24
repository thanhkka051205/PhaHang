/**
 * Bảo vệ route và phân quyền theo 3 vai trò: CUSTOMER / STAFF / ADMIN
 */
import { authStore } from '../stores/authStore.js';
import { ROLES, ROLE_HOME } from '../config/roles.js';
import { ROUTES } from '../config/routes.js';

export function requireAdminOnly() {
  const user = authStore.getAdminUser();
  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.STAFF)) {
    window.location.replace(ROUTES.admin.login);
    return false;
  }
  if (user.role === ROLES.STAFF) {
    window.location.replace(ROLE_HOME[ROLES.STAFF]);
    return false;
  }
  return true;
}

export function requireStaffOrAdmin() {
  const user = authStore.getAdminUser();
  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.STAFF)) {
    window.location.replace(ROUTES.admin.login);
    return false;
  }
  return true;
}

export function requireAdmin() {
  return requireStaffOrAdmin();
}

export function requireCustomer() {
  const user = authStore.getClientUser();
  if (!user) {
    window.location.replace(
      ROUTES.customer.login + '?redirect=' + encodeURIComponent(window.location.pathname + window.location.search)
    );
    return false;
  }
  return true;
}
