/**
 * Shared Layout cho phân hệ Nhân viên (STAFF)
 */
import { authStore } from '../../shared/stores/authStore.js';
import { requireStaffOrAdmin } from '../../shared/core/guard.js';
import { ROLES, ROLE_HOME } from '../../shared/config/roles.js';
import { ROUTES } from '../../shared/config/routes.js';
import { esc } from '../../shared/core/dom.js';

export function mountStaffLayout(activeMenu = 'dashboard') {
  if (!requireStaffOrAdmin()) return false;

  const staffUser = authStore.getAdminUser();
  const isAdmin = staffUser?.role === ROLES.ADMIN;

  const sidebarEl = document.getElementById('staff-sidebar');
  const topbarEl = document.getElementById('staff-topbar');

  if (sidebarEl) {
    const menuItems = [
      { id: 'dashboard', name: 'Tổng Quan Ca Làm Việc', path: ROUTES.staff.dashboard, icon: 'clipboard-list' },
      { id: 'orders', name: 'Xử Lý Đơn & Xuất Kho', path: ROUTES.staff.orders, icon: 'shopping-bag' },
      { id: 'products', name: 'Tra Cứu & Tồn Kho', path: ROUTES.staff.products, icon: 'box' },
      { id: 'warranties', name: 'Tiếp Nhận Bảo Hành', path: ROUTES.staff.warranties, icon: 'shield-check' },
    ];

    sidebarEl.className = 'w-64 bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 select-none shadow-xs min-h-screen';
    sidebarEl.innerHTML = `
      <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-200 bg-white">
        <div class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
          <i data-lucide="headset" class="w-5 h-5"></i>
        </div>
        <div>
          <h2 class="text-sm font-black text-slate-900 tracking-tight">ĐIỆN MÁY PHA HẰNG</h2>
          <span class="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">Cổng Nhân Viên</span>
        </div>
      </div>

      <div class="p-3 mx-3 my-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
        <p class="font-bold text-slate-900 truncate">${esc(staffUser?.fullName || 'Nhân viên')}</p>
        <div class="flex items-center justify-between mt-1">
          <span class="text-[10px] text-slate-500 truncate font-mono">${esc(staffUser?.email || '')}</span>
          <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            ${esc(staffUser?.role || ROLES.STAFF)}
          </span>
        </div>
      </div>

      <nav class="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        ${menuItems.map(item => {
          const isActive = activeMenu === item.id;
          return `
            <a
              href="${item.path}"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${isActive ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}"
            >
              <div class="flex items-center gap-2.5">
                <i data-lucide="${item.icon}" class="w-4 h-4 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}"></i>
                <span>${esc(item.name)}</span>
              </div>
              ${isActive ? '<i data-lucide="chevron-right" class="w-3.5 h-3.5 text-emerald-600"></i>' : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <div class="p-3 border-t border-slate-200 space-y-1 bg-slate-50">
        ${isAdmin ? `
          <a
            href="${ROLE_HOME[ROLES.ADMIN]}"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#DC2626] hover:bg-red-50 rounded-xl transition-colors"
          >
            <i data-lucide="shield" class="w-4 h-4"></i>
            <span>Sang Cổng Admin</span>
          </a>
        ` : ''}
        <button
          type="button"
          id="staff-logout-btn"
          class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <i data-lucide="log-out" class="w-4 h-4"></i>
          <span>Đăng Xuất</span>
        </button>
      </div>
    `;

    const logoutBtn = document.getElementById('staff-logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        authStore.logoutAdmin();
        window.location.href = ROUTES.admin.login;
      };
    }
  }

  if (topbarEl) {
    topbarEl.className = 'h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between';
    topbarEl.innerHTML = `
      <div class="flex items-center gap-2">
        <h1 class="text-sm sm:text-base font-bold text-slate-800">
          ${activeMenu === 'dashboard' ? '📋 Tổng Quan Ca Làm Việc Nhân Viên' : ''}
          ${activeMenu === 'orders' ? '📑 Xử Lý Đơn Hàng & Xuất Kho Gán Seri' : ''}
          ${activeMenu === 'products' ? '📦 Tra Cứu Sản Phẩm & Tồn Kho Showroom' : ''}
          ${activeMenu === 'warranties' ? '🛡️ Tiếp Nhận & Tra Cứu Bảo Hành Điện Tử' : ''}
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-slate-500 hidden sm:inline">Khu vực nghiệp vụ Nhân viên Showroom</span>
        <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-800 border border-emerald-200">
          ${esc((staffUser?.fullName || 'S').charAt(0).toUpperCase())}
        </div>
      </div>
    `;
  }

  window.lucide?.createIcons();
  return true;
}
