/**
 * Định nghĩa 3 vai trò người dùng chuẩn toàn hệ thống:
 * - CUSTOMER: Khách hàng mua sắm & tra cứu bảo hành
 * - STAFF: Nhân viên showroom (xử lý đơn hàng, xuất kho seri, tồn kho, bảo hành)
 * - ADMIN: Quản trị viên (toàn quyền: thống kê, phân quyền, voucher, sản phẩm, đơn, bảo hành)
 */
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
};

export const ROLE_HOME = {
  [ROLES.CUSTOMER]: '/customer/pages/home.html',
  [ROLES.STAFF]: '/staff/pages/index.html',
  [ROLES.ADMIN]: '/admin/pages/index.html',
};

export const ROLE_LABELS = {
  [ROLES.CUSTOMER]: 'Khách hàng',
  [ROLES.STAFF]: 'Nhân viên',
  [ROLES.ADMIN]: 'Quản trị viên',
};

export function isStaffRole(role) {
  return role === ROLES.STAFF;
}

export function isAdminRole(role) {
  return role === ROLES.ADMIN;
}

export function isInternalRole(role) {
  return role === ROLES.STAFF || role === ROLES.ADMIN;
}
