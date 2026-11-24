/**
 * Script Dashboard Thống Kê (admin/index.html)
 * Tái tạo 100% diện mạo và class Tailwind từ DashboardView.vue (commit 1a9e3c2)
 */
import { mountAdminLayout } from '../components/adminLayout.js';
import { requireAdminOnly } from '../../shared/core/guard.js';
import { mockService } from '../../shared/services/mockService.js';
import { formatVND, formatDate } from '../../shared/core/format.js';
import { esc } from '../../shared/core/dom.js';
import { renderBackendGapBanner } from '../../shared/core/backendGaps.js';

export async function initDashboardPage() {
  if (!requireAdminOnly()) return;
  const allowed = mountAdminLayout('dashboard');
  if (!allowed) return;

  const content = document.getElementById('dashboard-content');
  if (!content) return;

  const stats = await mockService.getDashboardStats();

  content.innerHTML = `
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <i data-lucide="bar-chart-3" class="w-6 h-6 text-[#DC2626]"></i>
          <span>Thống Kê Doanh Thu & Báo Cáo Pha Hằng</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Báo cáo doanh thu theo ngày, theo tháng và top sản phẩm điện máy bán chạy nhất
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 font-mono shadow-xs">
          <i data-lucide="calendar" class="w-4 h-4 text-[#DC2626]"></i>
          Kỳ Báo Cáo: Năm 2026
        </span>
      </div>
    </div>

    <!-- 4 Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh Thu Tháng</p>
          </div>
          <p class="text-xl xl:text-2xl font-black text-slate-900 font-mono mt-1 whitespace-nowrap">
            ${formatVND(stats.revenueMonth || 560000000)}
          </p>
          <span class="text-[11px] font-bold text-emerald-700 block font-mono">↑ +18.2% vs tháng trước</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center border border-red-100 shadow-xs">
          <i data-lucide="dollar-sign" class="w-5 h-5"></i>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng Đơn Hàng</p>
          </div>
          <p class="text-xl xl:text-2xl font-black text-slate-900 font-mono mt-1 whitespace-nowrap">
            ${stats.totalOrders || 42} đơn
          </p>
          <span class="text-[11px] font-bold text-emerald-700 block font-mono">Tỷ lệ hoàn tất 97.6%</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-xs">
          <i data-lucide="shopping-cart" class="w-5 h-5"></i>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giá Trị TB / Đơn</p>
          </div>
          <p class="text-xl xl:text-2xl font-black text-slate-900 font-mono mt-1 whitespace-nowrap">
            ${formatVND(stats.avgOrderValue || 13330000)}
          </p>
          <span class="text-[11px] text-slate-500 block font-mono">Điện máy & Gia dụng</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs">
          <i data-lucide="trending-up" class="w-5 h-5"></i>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tồn Kho Điện Máy</p>
          </div>
          <p class="text-xl xl:text-2xl font-black text-slate-900 font-mono mt-1 whitespace-nowrap">
            ${stats.totalStock || 186} chiếc
          </p>
          <span class="text-[11px] text-slate-500 block font-mono">5 Ngành hàng chính</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-xs">
          <i data-lucide="box" class="w-5 h-5"></i>
        </div>
      </div>
    </div>

    <!-- 2 Bảng: Doanh thu theo ngành hàng & Top sản phẩm bán chạy -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Bảng 1: Doanh thu 5 ngành hàng -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          <i data-lucide="pie-chart" class="w-4 h-4 text-[#DC2626]"></i>
          <span>Doanh Thu Theo 5 Ngành Hàng Chính</span>
        </h3>

        <div class="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
          <div class="grid grid-cols-12 p-3 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
            <span class="col-span-5">Ngành Hàng</span>
            <span class="col-span-3 text-center">Đã Bán</span>
            <span class="col-span-4 text-right">Doanh Thu</span>
          </div>
          <div class="grid grid-cols-12 p-3 items-center">
            <span class="col-span-5 font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>📺 Ti vi Smart 4K & OLED</span>
            </span>
            <span class="col-span-3 text-center font-mono font-semibold">18 chiếc</span>
            <span class="col-span-4 text-right font-mono font-black text-[#DC2626]">270.000.000 ₫</span>
          </div>
          <div class="grid grid-cols-12 p-3 items-center">
            <span class="col-span-5 font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>❄️ Điều hòa Inverter</span>
            </span>
            <span class="col-span-3 text-center font-mono font-semibold">14 bộ</span>
            <span class="col-span-4 text-right font-mono font-black text-[#DC2626]">145.000.000 ₫</span>
          </div>
          <div class="grid grid-cols-12 p-3 items-center">
            <span class="col-span-5 font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>🧊 Tủ lạnh Side by Side</span>
            </span>
            <span class="col-span-3 text-center font-mono font-semibold">6 chiếc</span>
            <span class="col-span-4 text-right font-mono font-black text-[#DC2626]">95.000.000 ₫</span>
          </div>
          <div class="grid grid-cols-12 p-3 items-center">
            <span class="col-span-5 font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>💨 Quạt làm mát</span>
            </span>
            <span class="col-span-3 text-center font-mono font-semibold">22 chiếc</span>
            <span class="col-span-4 text-right font-mono font-black text-[#DC2626]">22.000.000 ₫</span>
          </div>
          <div class="grid grid-cols-12 p-3 items-center">
            <span class="col-span-5 font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>🍚 Nồi cơm điện tử</span>
            </span>
            <span class="col-span-3 text-center font-mono font-semibold">12 nồi</span>
            <span class="col-span-4 text-right font-mono font-black text-[#DC2626]">28.000.000 ₫</span>
          </div>
        </div>
      </div>

      <!-- Bảng 2: Top sản phẩm bán chạy nhất -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          <i data-lucide="award" class="w-4 h-4 text-amber-500"></i>
          <span>Top Thiết Bị Bán Chạy Nhất</span>
        </h3>

        <div class="space-y-3 text-xs">
          ${[
            { rank: 1, name: 'Smart Tivi OLED Sony 4K 55 inch', cat: 'Ti vi', sold: 8, revenue: '144.000.000 ₫' },
            { rank: 2, name: 'Điều hòa Daikin Inverter 9000 BTU', cat: 'Điều hòa', sold: 9, revenue: '85.500.000 ₫' },
            { rank: 3, name: 'Tủ lạnh Aqua Inverter 322 lít', cat: 'Tủ lạnh', sold: 4, revenue: '36.800.000 ₫' },
            { rank: 4, name: 'Quạt đứng Senko DR1608 có điều khiển', cat: 'Quạt', sold: 18, revenue: '10.800.000 ₫' },
            { rank: 5, name: 'Nồi cơm điện tử cao tần Cuckoo 1.8L', cat: 'Nồi cơm điện', sold: 7, revenue: '24.500.000 ₫' }
          ].map(p => `
            <div class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${p.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-200' : p.rank === 2 ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500'}">
                  ${p.rank}
                </span>
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 truncate">${esc(p.name)}</p>
                  <p class="text-[11px] text-slate-400 font-medium">${esc(p.cat)} · Đã bán ${p.sold} cái</p>
                </div>
              </div>
              <span class="font-mono font-bold text-slate-900 text-right shrink-0">${p.revenue}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  window.lucide?.createIcons();
}

initDashboardPage();
