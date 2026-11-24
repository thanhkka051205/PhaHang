/**
 * Tổng quan công việc cho Nhân viên (staff/pages/index.html)
 */
import { mountStaffLayout } from '../components/staffLayout.js';
import { mockService } from '../../shared/services/mockService.js';
import { ROUTES } from '../../shared/config/routes.js';

export async function initStaffDashboardPage() {
  if (!mountStaffLayout('dashboard')) return;
  const content = document.getElementById('staff-dashboard-content');
  if (!content) return;

  const [orders, productsRes, warranties] = await Promise.all([
    mockService.getOrders(),
    mockService.getProducts({ limit: 100, includeHidden: false }),
    mockService.getWarranties(),
  ]);

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const shippingOrders = orders.filter(o => o.status === 'SHIPPING').length;
  const productCount = (productsRes?.items || []).length;
  const warrantyCount = warranties.length;

  content.innerHTML = `
    <div class="border-b border-slate-200 pb-4">
      <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Bảng Công Việc Ca Trực</h1>
      <p class="text-xs text-slate-500 mt-1">Theo dõi đơn chờ xử lý, đơn đang giao lắp, tồn kho và hồ sơ bảo hành</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <a href="${ROUTES.staff.orders}" class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
        <p class="text-[11px] font-bold text-slate-400 uppercase">Đơn Chờ Xác Nhận</p>
        <p class="text-2xl font-black text-amber-600 font-mono mt-1">${pendingOrders}</p>
        <p class="text-xs text-slate-500 mt-1">Đang giao & lắp: <strong class="font-mono">${shippingOrders}</strong></p>
      </a>

      <a href="${ROUTES.staff.orders}" class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
        <p class="text-[11px] font-bold text-slate-400 uppercase">Tổng Đơn Hàng</p>
        <p class="text-2xl font-black text-slate-900 font-mono mt-1">${orders.length}</p>
        <p class="text-xs text-slate-500 mt-1">Xử lý & gán số seri xuất kho</p>
      </a>

      <a href="${ROUTES.staff.products}" class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
        <p class="text-[11px] font-bold text-slate-400 uppercase">Thiết Bị Đang Bán</p>
        <p class="text-2xl font-black text-emerald-700 font-mono mt-1">${productCount}</p>
        <p class="text-xs text-slate-500 mt-1">Kiểm tra tồn kho & cấu hình</p>
      </a>

      <a href="${ROUTES.staff.warranties}" class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-red-300 transition-colors">
        <p class="text-[11px] font-bold text-slate-400 uppercase">Hồ Sơ Bảo Hành</p>
        <p class="text-2xl font-black text-[#DC2626] font-mono mt-1">${warrantyCount}</p>
        <p class="text-xs text-slate-500 mt-1">Tra cứu & hỗ trợ khách hàng</p>
      </a>
    </div>
  `;
  window.lucide?.createIcons();
}

initStaffDashboardPage();
