/**
 * Bản đồ đường dẫn tập trung theo 3 vai trò (customer / staff / admin)
 */
export const ROUTES = {
  root: '/index.html',
  customer: {
    home: '/customer/pages/home.html',
    login: '/customer/pages/login.html',
    register: '/customer/pages/register.html',
    productDetail: '/customer/pages/product-detail.html',
    cart: '/customer/pages/cart.html',
    checkout: '/customer/pages/checkout.html',
    orderSuccess: '/customer/pages/order-success.html',
    myOrders: '/customer/pages/my-orders.html',
    warranty: '/customer/pages/warranty.html',
  },
  staff: {
    login: '/admin/pages/login.html',
    dashboard: '/staff/pages/index.html',
    orders: '/staff/pages/orders.html',
    products: '/staff/pages/products.html',
    warranties: '/staff/pages/warranties.html',
  },
  admin: {
    login: '/admin/pages/login.html',
    dashboard: '/admin/pages/index.html',
    users: '/admin/pages/users.html',
    products: '/admin/pages/products.html',
    orders: '/admin/pages/orders.html',
    coupons: '/admin/pages/coupons.html',
    warranties: '/admin/pages/warranties.html',
  },
};
