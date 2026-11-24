/**
 * Script Sổ Cái Bảo Hành (admin/warranties.html)
 * Tái tạo 100% diện mạo và class Tailwind từ WarrantyListView.vue (commit 1a9e3c2)
 */
import { mountAdminLayout } from '../components/staffLayout.js';
import { mockService } from '../../shared/services/mockService.js';
import { formatDate } from '../../shared/core/format.js';
import { esc } from '../../shared/core/dom.js';

let warranties = [];
let searchQuery = '';

export async function initAdminWarrantiesPage() {
  const allowed = mountStaffLayout('warranties');
  if (!allowed) return;

  await loadWarranties();
}

async function loadWarranties() {
  warranties = await mockService.getWarranties();
  renderWarrantiesTable();
}

function renderWarrantiesTable() {
  const content = document.getElementById('warranties-content');
  if (!content) return;

  const filtered = warranties.filter(w => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const s = (w.serialNumber || '').toLowerCase();
    const c = (w.customerName || '').toLowerCase();
    const p = (w.productName || '').toLowerCase();
    const phone = (w.customerPhone || '');
    return s.includes(q) || c.includes(q) || p.includes(q) || phone.includes(q);
  });

  content.innerHTML = `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <i data-lucide="shield-check" class="w-6 h-6 text-[#DC2626]"></i>
          <span>Sổ Cái Bảo Hành Thiết Bị Điện Máy (${warranties.length})</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Hồ sơ toàn bộ thiết bị đã kích hoạt bảo hành theo Số seri duy nhất khi xuất kho giao hàng
        </p>
      </div>
    </div>

    <!-- Ô tìm kiếm nhanh -->
    <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative max-w-sm w-full">
        <input
          type="text"
          id="warranty-filter-input"
          value="${esc(searchQuery)}"
          placeholder="Tìm theo số Seri, tên khách, máy, SĐT..."
          class="w-full h-10 pl-9 pr-4 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#DC2626] outline-hidden font-medium"
        />
        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"></i>
      </div>

      <span class="text-xs text-slate-500 font-mono">
        Hiển thị: <strong class="text-slate-900">${filtered.length}</strong> / ${warranties.length} hồ sơ bảo hành
      </span>
    </div>

    <!-- Bảng Sổ Cái Bảo Hành -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              <th class="p-3.5">Số Seri Thiết Bị</th>
              <th class="p-3.5">Tên Thiết Bị & Mã Đơn</th>
              <th class="p-3.5">Khách Hàng Đăng Ký</th>
              <th class="p-3.5 text-center">Ngày Kích Hoạt</th>
              <th class="p-3.5 text-center">Ngày Hết Hạn</th>
              <th class="p-3.5 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${filtered.map(w => `
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="p-3.5 font-mono font-bold text-slate-900">
                  <div class="flex items-center gap-1.5">
                    <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
                    <span class="text-emerald-700 tracking-wider">${esc(w.serialNumber)}</span>
                  </div>
                </td>
                <td class="p-3.5">
                  <p class="font-bold text-slate-900">${esc(w.productName)}</p>
                  <p class="text-[11px] text-[#DC2626] font-mono">Đơn hàng #DH${w.orderId}</p>
                </td>
                <td class="p-3.5">
                  <p class="font-bold text-slate-900">${esc(w.customerName)}</p>
                  <p class="text-slate-500 font-mono text-[11px]">${esc(w.customerPhone)}</p>
                </td>
                <td class="p-3.5 text-center font-mono text-slate-600">
                  ${formatDate(w.activatedDate)}
                </td>
                <td class="p-3.5 text-center font-mono font-bold text-amber-700">
                  ${formatDate(w.expireDate)}
                </td>
                <td class="p-3.5 text-center">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ${esc(w.statusText || 'Bảo Hành Chính Hãng')}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const input = document.getElementById('warranty-filter-input');
  if (input) {
    input.oninput = () => {
      searchQuery = input.value.trim();
      renderWarrantiesTable();
    };
  }

  window.lucide?.createIcons();
}

initAdminWarrantiesPage();
