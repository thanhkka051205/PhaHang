/**
 * Script trang Đặt Hàng Thành Công (order-success.html)
 * Tái tạo 100% diện mạo và class Tailwind từ OrderSuccessView.vue (commit 1a9e3c2)
 */
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { formatVND, formatDate } from '../core/format.js';
import { esc, getQueryParam } from '../core/dom.js';

export function initOrderSuccessPage() {
  mountHeader();
  mountFooter();

  const container = document.getElementById('order-success-container');
  if (!container) return;

  const orderId = getQueryParam('orderId') || '1001';
  let orderData = null;

  try {
    const raw = sessionStorage.getItem('last_created_order');
    if (raw) orderData = JSON.parse(raw);
  } catch (e) {}

  container.innerHTML = `
    <div class="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-6">
      <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
        <i data-lucide="check-circle-2" class="w-10 h-10"></i>
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Đặt Hàng Thành Công!
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Cảm ơn quý khách đã tin tưởng mua sắm thiết bị tại <strong>Điện Máy Pha Hằng</strong>. Kỹ thuật viên showroom sẽ liên hệ trong 15 phút để xác nhận lịch giao và lắp đặt tận nhà.
        </p>
      </div>

      <!-- Khung tóm tắt đơn -->
      <div class="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs space-y-2.5 text-left font-medium">
        <div class="flex justify-between items-center pb-2 border-b border-slate-200">
          <span class="text-slate-500">Mã đơn hàng:</span>
          <span class="font-bold font-mono text-[#DC2626] text-sm">#DH${orderId}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500">Người nhận:</span>
          <span class="font-bold text-slate-900">${esc(orderData?.customerName || 'Khách hàng')}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500">Số điện thoại:</span>
          <span class="font-bold font-mono text-slate-900">${esc(orderData?.phone || '0988123456')}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500">Địa chỉ giao:</span>
          <span class="font-bold text-slate-900 text-right truncate max-w-xs">${esc(orderData?.address || 'Hà Nội')}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500">Phương thức:</span>
          <span class="font-bold text-slate-900">${orderData?.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Thanh toán khi nhận hàng (COD)'}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
          <span class="font-bold text-slate-900">Tổng thanh toán:</span>
          <span class="font-black font-mono text-[#DC2626]">${formatVND(orderData?.totalAmount || 0)}</span>
        </div>
      </div>

      <!-- Nút hành động -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href="/my-orders.html"
          class="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <i data-lucide="package-check" class="w-4 h-4"></i>
          <span>Xem Lịch Sử Đơn Hàng</span>
        </a>

        <a
          href="/index.html"
          class="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Tiếp Tục Mua Sắm</span>
        </a>
      </div>
    </div>
  `;

  window.lucide?.createIcons();
}

initOrderSuccessPage();
