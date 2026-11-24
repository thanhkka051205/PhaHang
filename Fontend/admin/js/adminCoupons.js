/**
 * Script Quản Lý Voucher Khuyến Mãi (admin/coupons.html)
 * Tái tạo 100% diện mạo và class Tailwind từ CouponListView.vue (commit 1a9e3c2)
 */
import { mountAdminLayout } from '../components/adminLayout.js';
import { requireAdminOnly } from '../../shared/core/guard.js';
import { mockService } from '../../shared/services/mockService.js';
import { formatVND, formatDate } from '../../shared/core/format.js';
import { esc } from '../../shared/core/dom.js';
import { openModal } from '../../shared/ui/modal.js';
import { toast } from '../../shared/ui/toast.js';
import { renderBackendGapBanner } from '../../shared/core/backendGaps.js';

let coupons = [];

export async function initAdminCouponsPage() {
  if (!requireAdminOnly()) return;
  const allowed = mountAdminLayout('coupons');
  if (!allowed) return;

  await loadCoupons();
}

async function loadCoupons() {
  coupons = await mockService.getCoupons();
  renderCouponsTable();
}

function renderCouponsTable() {
  const content = document.getElementById('coupons-content');
  if (!content) return;

  content.innerHTML = `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <i data-lucide="tag" class="w-6 h-6 text-[#DC2626]"></i>
          <span>Quản Lý Mã Khuyến Mãi & Voucher (${coupons.length})</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Thiết lập mã giảm giá trực tiếp cho khách hàng mua hàng tại website hoặc showroom Pha Hằng
        </p>
      </div>

      <button
        type="button"
        id="btn-add-coupon"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-btn-brand transition-all cursor-pointer"
      >
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>Tạo Voucher Mới</span>
      </button>
    </div>

    <!-- Bảng danh sách voucher -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              <th class="p-3.5">Mã Voucher</th>
              <th class="p-3.5">Mức Giảm Giá</th>
              <th class="p-3.5">Đơn Hàng Tối Thiểu</th>
              <th class="p-3.5 text-center">Lượt Sử Dụng</th>
              <th class="p-3.5 text-center">Hạn Sử Dụng</th>
              <th class="p-3.5 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${coupons.map(c => `
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="p-3.5">
                  <span class="px-2.5 py-1 rounded-lg bg-red-50 text-[#DC2626] font-mono font-black border border-red-200 text-xs">
                    ${esc(c.code)}
                  </span>
                </td>
                <td class="p-3.5 font-bold text-slate-900 font-mono">
                  ${formatVND(c.discountAmount)}
                </td>
                <td class="p-3.5 text-slate-600 font-mono">
                  ${formatVND(c.minOrderValue || 0)}
                </td>
                <td class="p-3.5 text-center font-mono font-semibold text-slate-700">
                  ${c.usedCount || 0} / ${c.maxUsage || 100}
                </td>
                <td class="p-3.5 text-center font-mono text-slate-600">
                  ${formatDate(c.expiryDate)}
                </td>
                <td class="p-3.5 text-center">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">
                    ${c.isActive ? 'ĐANG KÍCH HOẠT' : 'HẾT HẠN'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindCouponEvents();
  window.lucide?.createIcons();
}

function bindCouponEvents() {
  document.getElementById('btn-add-coupon')?.addEventListener('click', () => {
    const modal = openModal({
      title: 'Tạo Mã Giảm Giá Voucher Mới',
      bodyHtml: `
        <form id="new-coupon-form" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mã Voucher (In hoa) <span class="text-[#DC2626]">*</span>:</label>
            <input type="text" id="cp-code" placeholder="Ví dụ: TRIAN100K" class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-mono font-bold uppercase focus:border-[#DC2626] outline-hidden" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Số tiền giảm giá (VND) <span class="text-[#DC2626]">*</span>:</label>
            <input type="number" id="cp-amount" value="50000" class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-mono font-bold focus:border-[#DC2626] outline-hidden" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Áp dụng cho đơn hàng tối thiểu (VND):</label>
            <input type="number" id="cp-min" value="500000" class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-mono font-bold focus:border-[#DC2626] outline-hidden" />
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" id="btn-save-coupon" class="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
          Lưu & Phát Hành Voucher
        </button>
      `,
      maxWidth: '460px'
    });

    modal.element.querySelector('#btn-save-coupon')?.addEventListener('click', async () => {
      const code = modal.element.querySelector('#cp-code')?.value?.trim().toUpperCase();
      const amount = Number(modal.element.querySelector('#cp-amount')?.value) || 0;
      const minOrder = Number(modal.element.querySelector('#cp-min')?.value) || 0;

      if (!code || amount <= 0) {
        toast.warning('Vui lòng nhập mã và số tiền giảm hợp lệ!');
        return;
      }

      await mockService.createCoupon({
        code,
        discountAmount: amount,
        minOrderValue: minOrder,
        expiryDate: '2026-12-31',
        isActive: true,
        usedCount: 0,
        maxUsage: 100
      });

      toast.success(`Đã tạo và kích hoạt mã giảm giá ${code} thành công!`);
      modal.close();
      loadCoupons();
    });
  });
}

initAdminCouponsPage();
