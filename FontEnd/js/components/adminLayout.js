/**
 * Shared Admin Layout (UI-09, TASK-018)
 * Tái tạo 100% diện mạo và class Tailwind từ AdminSidebar.vue (commit 1a9e3c2)
 */
import { authStore } from '../stores/authStore.js';
import { requireAdmin } from '../core/guard.js';
import { esc } from '../core/dom.js';

export function mountAdminLayout(activeMenu = 'dashboard') {
  if (!requireAdmin()) return false;

  const adminUser = authStore.getAdminUser();
  const isAdmin = adminUser?.role === 'ADMIN';

  const sidebarEl = document.getElementById('admin-sidebar');
  const topbarEl = document.getElementById('admin-topbar');

  if (sidebarEl) {
    const menuItems = [
      { id: 'dashboard', name: 'Thống Kê Doanh Thu', path: '/admin/index.html', icon: 'layout-dashboard', adminOnly: true },
      { id: 'orders', name: 'Quản Lý Đơn Hàng', path: '/admin/orders.html', icon: 'shopping-bag', adminOnly: false },
      { id: 'products', name: 'Sản Phẩm & Tồn Kho', path: '/admin/products.html', icon: 'box', adminOnly: false },
      { id: 'warranties', name: 'Tra Cứu Bảo Hành', path: '/admin/warranties.html', icon: 'shield-check', adminOnly: false },
      { id: 'coupons', name: 'Quản Lý Khuyến Mãi', path: '/admin/coupons.html', icon: 'tag', adminOnly: true },
      { id: 'users', name: 'Tài Khoản & Phân Quyền', path: '/admin/users.html', icon: 'users', adminOnly: true }
    ];

    const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);

    sidebarEl.className = 'w-64 bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 select-none shadow-xs min-h-screen';
    sidebarEl.innerHTML = `
      <!-- Brand Header -->
      <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-200 bg-white">
        <div class="w-9 h-9 rounded-xl bg-[#DC2626] flex items-center justify-center text-white shadow-xs">
          <i data-lucide="tv" class="w-5 h-5"></i>
        </div>
        <div>
          <h2 class="text-sm font-black text-slate-900 tracking-tight">ĐIỆN MÁY PHA HẰNG</h2>
          <span class="text-[10px] text-[#DC2626] font-bold tracking-wider uppercase">Quản Trị Hệ Thống</span>
        </div>
      </div>

      <!-- User Profile Badge -->
      <div class="p-3 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <p class="font-bold text-slate-900 truncate">${esc(adminUser?.fullName || 'Quản trị viên')}</p>
        <div class="flex items-center justify-between mt-1">
          <span class="text-[10px] text-slate-500 truncate font-mono">${esc(adminUser?.email || '')}</span>
          <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${isAdmin ? 'bg-red-100 text-[#DC2626] border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
            ${esc(adminUser?.role || 'STAFF')}
          </span>
        </div>
      </div>

      <!-- Menu Links (UI-09) -->
      <nav class="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        ${visibleItems.map(item => {
          const isActive = activeMenu === item.id;
          return `
            <a
              href="${item.path}"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${isActive ? 'bg-red-50 text-[#DC2626] font-bold border border-red-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}"
            >
              <div class="flex items-center gap-2.5">
                <i data-lucide="${item.icon}" class="w-4 h-4 transition-colors ${isActive ? 'text-[#DC2626]' : 'text-slate-400 group-hover:text-slate-600'}"></i>
                <span>${esc(item.name)}</span>
              </div>
              ${isActive ? '<i data-lucide="chevron-right" class="w-3.5 h-3.5 text-[#DC2626]"></i>' : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Footer Actions -->
      <div class="p-3 border-t border-slate-200 space-y-1 bg-slate-50">
        <button
          type="button"
          id="admin-logout-btn"
          class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <i data-lucide="log-out" class="w-4 h-4"></i>
          <span>Đăng Xuất</span>
        </button>
      </div>
    `;

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        authStore.logoutAdmin();
        window.location.href = '/admin/login.html';
      };
    }
  }

  if (topbarEl) {
    topbarEl.className = 'h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between';
    topbarEl.innerHTML = `
      <div class="flex items-center gap-2">
        <h1 class="text-sm sm:text-base font-bold text-slate-800">
          ${activeMenu === 'dashboard' ? '📊 Thống Kê Tổng Quan Doanh Thu' : ''}
          ${activeMenu === 'orders' ? '📑 Quản Lý Đơn Hàng & Gán Số Seri' : ''}
          ${activeMenu === 'products' ? '📦 Quản Lý Danh Mục & Tồn Kho Sản Phẩm' : ''}
          ${activeMenu === 'warranties' ? '🛡️ Quản Lý Bảo Hành Điện Tử Showroom' : ''}
          ${activeMenu === 'coupons' ? '🎟️ Quản Lý Mã Khuyến Mãi Voucher' : ''}
          ${activeMenu === 'users' ? '👥 Quản Lý Người Dùng & Phân Quyền' : ''}
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-slate-500 hidden sm:inline">Khu vực quản trị nội bộ Showroom Đình Xuyên</span>
        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-200">
          ${esc((adminUser?.fullName || 'A').charAt(0).toUpperCase())}
        </div>
      </div>
    `;
  }

  window.lucide?.createIcons();
  return true;
}
