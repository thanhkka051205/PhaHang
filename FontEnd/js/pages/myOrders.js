/**
 * Script trang Lịch Sử & Tra Cứu Đơn Hàng (my-orders.html)
 * Bảo vệ quyền riêng tư theo Nghị định 13/2023/NĐ-CP và DEC-001:
 * - Khách hàng đăng nhập: Chỉ xem đơn hàng của chính mình (getMyOrders).
 * - Khách vãng lai: Tra cứu an toàn qua cặp [Mã đơn hàng + Số điện thoại], che mờ PII.
 */
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { mockService } from '../services/mockService.js';
import { authStore } from '../stores/authStore.js';
import { formatVND, formatDate } from '../core/format.js';
import { esc } from '../core/dom.js';
import { confirmDialog, openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { showFieldError, clearFieldError } from '../core/validate.js';
import { renderBackendGapBanner } from '../core/backendGaps.js';

let activeTab = 'ALL';
let myOrders = [];
let currentGuestOrder = null;

export async function initMyOrdersPage() {
  mountHeader();
  mountFooter();

  const user = authStore.getClientUser();
  if (user) {
    myOrders = await mockService.getMyOrders(user);
  }
  renderMyOrders();

  authStore.subscribeClient(async () => {
    const updatedUser = authStore.getClientUser();
    if (updatedUser) {
      myOrders = await mockService.getMyOrders(updatedUser);
    } else {
      myOrders = [];
      currentGuestOrder = null;
    }
    renderMyOrders();
  });
}

function renderMyOrders() {
  const container = document.getElementById('my-orders-container');
  if (!container) return;

  const user = authStore.getClientUser();

  const statusMeta = {
    PENDING: { label: 'Chờ xác nhận & Lắp đặt', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    SHIPPING: { label: 'Đang vận chuyển & Lắp đặt', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    COMPLETED: { label: 'Đã hoàn thành bàn giao', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy đơn', color: 'bg-rose-100 text-rose-800 border-rose-200' }
  };

  // 1. TRƯỜNG HỢP KHÁCH HÀNG ĐÃ ĐĂNG NHẬP
  if (user) {
    const filtered = activeTab === 'ALL'
      ? myOrders
      : myOrders.filter(o => o.status === activeTab);

    container.innerHTML = `
      <div class="space-y-6 max-w-4xl mx-auto pb-16">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <i data-lucide="package-check" class="w-6 h-6 text-[#DC2626]"></i>
              <span>Đơn Hàng Của Tôi</span>
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Tài khoản: <strong class="text-slate-800">${esc(user.fullName)}</strong> (${esc(user.phone || user.email)})
            </p>
          </div>

          <a href="/index.html" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#DC2626] transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Mua sắm thêm</span>
          </a>
        </div>

        <!-- Tabs trạng thái -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
          ${[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ xử lý' },
            { id: 'SHIPPING', label: 'Đang giao & lắp' },
            { id: 'COMPLETED', label: 'Đã hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' }
          ].map(tab => `
            <button
              type="button"
              class="tab-btn px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id ? 'bg-[#DC2626] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}"
              data-tab="${tab.id}"
            >
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Danh sách card đơn hàng -->
        ${filtered.length > 0 ? `
          <div class="space-y-4">
            ${filtered.map(order => renderOrderCard(order, statusMeta)).join('')}
          </div>
        ` : `
          <div class="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div class="w-16 h-16 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <i data-lucide="package-open" class="w-8 h-8"></i>
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-1">Chưa có đơn hàng nào</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Quý khách chưa có đơn hàng nào ở trạng thái này.
            </p>
            <a href="/index.html" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DC2626] text-white font-bold text-xs shadow-xs hover:bg-[#B91C1C] transition-colors">
              <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              <span>Mua sắm ngay</span>
            </a>
          </div>
        `}
      </div>
    `;
    bindOrderEvents();
    window.lucide?.createIcons();
    return;
  }

  // 2. TRƯỜNG HỢP KHÁCH VÃNG LAI (CHƯA ĐĂNG NHẬP)
  container.innerHTML = `
    <div class="space-y-8 max-w-3xl mx-auto pb-16">
      <div class="text-center space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#DC2626] border border-red-200 text-xs font-bold uppercase tracking-wider">
          <i data-lucide="shield-check" class="w-4 h-4"></i>
          <span>Tra Cứu Đơn Hàng An Toàn</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Kiểm Tra Tiến Độ Đơn Hàng Điện Máy
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Nhập <strong>Mã đơn hàng</strong> (VD: PH-1001 hoặc 1) và <strong>Số điện thoại</strong> đã dùng khi đặt hàng để kiểm tra lịch trình giao lắp và số seri bảo hành.
        </p>
      </div>

      <!-- Khung Tra cứu cho khách vãng lai -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
        <form id="guest-lookup-form" class="space-y-4" novalidate>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="space-y-1">
              <label class="block font-bold text-slate-800 text-xs">Mã đơn hàng <span class="text-[#DC2626]">*</span>:</label>
              <input
                type="text"
                id="guest-order-code"
                placeholder="Ví dụ: PH-1001 hoặc 1"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:border-[#DC2626] outline-hidden"
                required
              />
            </div>
            <div class="space-y-1">
              <label class="block font-bold text-slate-800 text-xs">Số điện thoại đặt hàng <span class="text-[#DC2626]">*</span>:</label>
              <input
                type="tel"
                id="guest-phone"
                placeholder="Ví dụ: 0912345678"
                class="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-[#DC2626] outline-hidden"
                required
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div class="text-[11px] text-slate-500">
              Gợi ý thử nghiệm: Mã <strong class="font-mono text-[#DC2626] cursor-pointer quick-fill-btn" data-code="PH-1001" data-phone="0912345678">PH-1001</strong> - SĐT <strong class="font-mono text-[#DC2626] cursor-pointer quick-fill-btn" data-code="PH-1001" data-phone="0912345678">0912345678</strong>
            </div>

            <button
              type="submit"
              id="btn-guest-search"
              class="w-full sm:w-auto px-6 h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-btn-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="search" class="w-4 h-4"></i>
              <span>Tra Cứu Đơn Hàng</span>
            </button>
          </div>
        </form>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Bạn đã có tài khoản thành viên?</span>
          <a href="/login.html" class="font-bold text-[#DC2626] hover:underline flex items-center gap-1">
            <span>Đăng nhập để xem toàn bộ lịch sử đơn</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>

      <!-- Vùng hiển thị kết quả tra cứu của khách vãng lai -->
      <div id="guest-order-result">
        ${currentGuestOrder ? `
          <div class="space-y-4">
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <span class="font-bold flex items-center gap-1.5">
                <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                <span>Đã tìm thấy thông tin đơn hàng #${currentGuestOrder.id}</span>
              </span>
              <span class="text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200">Đã che mờ PII</span>
            </div>
            ${renderOrderCard(currentGuestOrder, statusMeta)}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  bindGuestLookupEvents();
  bindOrderEvents();
  window.lucide?.createIcons();
}

function renderOrderCard(order, statusMeta) {
  const meta = statusMeta[order.status] || statusMeta.PENDING;
  return `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
      <!-- Header card đơn hàng -->
      <div class="p-4 sm:p-5 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3">
          <span class="font-mono font-bold text-slate-900 text-sm">#DH${order.id} (${esc(order.orderCode || 'PH-' + order.id)})</span>
          <span class="text-slate-400">·</span>
          <span class="text-slate-500 font-medium">Đặt ngày: ${formatDate(order.createdAt)}</span>
        </div>

        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.color}">
          ${meta.label}
        </span>
      </div>

      <!-- Danh sách sản phẩm của đơn -->
      <div class="p-4 sm:p-5 space-y-3">
        ${(order.items || []).map(item => `
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                <img src="${esc(item.image || 'https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png')}" alt="${esc(item.productName || '')}" class="max-w-full max-h-full object-contain" />
              </div>
              <div class="space-y-0.5 min-w-0">
                <p class="font-bold text-slate-900 truncate">${esc(item.productName || 'Thiết bị điện máy')}</p>
                <p class="text-slate-400 text-[11px]">Quy cách: ${esc(item.spec || item.variantInfo || 'Tiêu chuẩn')}</p>
                <p class="font-mono text-slate-600 font-semibold">SL: ${item.quantity} × ${formatVND(item.price || item.unitPrice || 0)}</p>
              </div>
            </div>

            <!-- Hiển thị Số seri xuất kho (Serial Number) nếu có -->
            <div class="flex flex-col sm:items-end gap-1 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              ${(item.serialNo || order.serialNumber) ? `
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
                  <span>Seri: <strong class="font-mono">${esc(item.serialNo || order.serialNumber)}</strong></span>
                </div>
                <a href="/warranty.html?serial=${encodeURIComponent(item.serialNo || order.serialNumber)}" class="text-[11px] font-bold text-[#DC2626] hover:underline flex items-center gap-0.5">
                  <span>Tra cứu bảo hành</span>
                  <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </a>
              ` : `
                <span class="text-[11px] text-slate-400 italic">Số seri sẽ được kích hoạt khi bàn giao</span>
              `}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Footer card đơn hàng: Tổng tiền & Nút hành động -->
      <div class="p-4 sm:p-5 bg-slate-50/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-baseline gap-2">
          <span class="text-slate-500 font-medium">Tổng số tiền:</span>
          <span class="text-base sm:text-lg font-black font-mono text-[#DC2626]">
            ${formatVND(order.totalAmount || 0)}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-view-order-detail px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            data-order-id="${order.id}"
          >
            Xem chi tiết
          </button>

          ${order.status === 'PENDING' ? `
            <button
              type="button"
              class="btn-cancel-order px-3.5 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
              data-order-id="${order.id}"
            >
              Hủy đơn
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function bindGuestLookupEvents() {
  const form = document.getElementById('guest-lookup-form');
  const codeInp = document.getElementById('guest-order-code');
  const phoneInp = document.getElementById('guest-phone');
  const searchBtn = document.getElementById('btn-guest-search');

  [codeInp, phoneInp].forEach(inp => {
    inp?.addEventListener('input', () => clearFieldError(inp));
  });

  document.querySelectorAll('.quick-fill-btn').forEach(btn => {
    btn.onclick = () => {
      if (codeInp) codeInp.value = btn.dataset.code;
      if (phoneInp) phoneInp.value = btn.dataset.phone;
    };
  });

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      clearFieldError(codeInp);
      clearFieldError(phoneInp);

      const code = codeInp?.value?.trim();
      const phone = phoneInp?.value?.trim();

      let hasErr = false;
      if (!code) {
        showFieldError(codeInp, 'Vui lòng nhập mã đơn hàng.');
        hasErr = true;
      }
      if (!phone) {
        showFieldError(phoneInp, 'Vui lòng nhập số điện thoại đặt hàng.');
        hasErr = true;
      }

      if (hasErr) return;

      searchBtn.disabled = true;
      searchBtn.innerHTML = `
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tìm kiếm...</span>
      `;

      try {
        currentGuestOrder = await mockService.lookupGuestOrder(code, phone);
        toast.success('Tìm thấy đơn hàng!');
        renderMyOrders();
      } catch (err) {
        searchBtn.disabled = false;
        searchBtn.innerHTML = `
          <i data-lucide="search" class="w-4 h-4"></i>
          <span>Tra Cứu Đơn Hàng</span>
        `;
        window.lucide?.createIcons();
        showFieldError(codeInp, err.message || 'Không tìm thấy đơn hàng phù hợp.');
        toast.error(err.message || 'Không tìm thấy đơn hàng.');
      }
    };
  }
}

function bindOrderEvents() {
  // 1. Chuyển tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeTab = btn.dataset.tab;
      renderMyOrders();
    };
  });

  // 2. Xem chi tiết đơn hàng
  document.querySelectorAll('.btn-view-order-detail').forEach(btn => {
    btn.onclick = async () => {
      const orderId = Number(btn.dataset.orderId);
      let order = myOrders.find(o => o.id === orderId);
      if (!order && currentGuestOrder && currentGuestOrder.id === orderId) {
        order = currentGuestOrder;
      }
      if (!order) return;

      openModal({
        title: `Chi Tiết Đơn Hàng #DH${order.id}`,
        bodyHtml: `
          <div class="space-y-4 text-xs">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-medium">
              <p><span class="text-slate-500">Mã đơn:</span> <strong class="text-slate-900 font-mono">${esc(order.orderCode || 'PH-' + order.id)}</strong></p>
              <p><span class="text-slate-500">Người nhận:</span> <strong class="text-slate-900">${esc(order.customerName || order.receiverName || 'Khách hàng')}</strong></p>
              <p><span class="text-slate-500">Điện thoại:</span> <strong class="text-slate-900 font-mono">${esc(order.phone || order.receiverPhone)}</strong></p>
              <p><span class="text-slate-500">Địa chỉ giao:</span> <strong class="text-slate-900">${esc(order.address || order.shipAddress)}</strong></p>
              <p><span class="text-slate-500">Phương thức:</span> <strong class="text-slate-900">${order.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' : 'COD khi giao hàng'}</strong></p>
              ${order.notes ? `<p><span class="text-slate-500">Ghi chú lắp đặt:</span> <span class="text-slate-700 italic">${esc(order.notes)}</span></p>` : ''}
            </div>

            <div class="border border-slate-200 rounded-xl divide-y divide-slate-100 p-2">
              ${(order.items || []).map(i => `
                <div class="p-2 flex justify-between items-center">
                  <div>
                    <p class="font-bold text-slate-800">${esc(i.productName)}</p>
                    <p class="text-slate-400 text-[11px]">SL: ${i.quantity} ${i.spec || i.variantInfo ? `• ${esc(i.spec || i.variantInfo)}` : ''}</p>
                    ${i.serialNo ? `<p class="text-[10px] text-emerald-600 font-mono font-bold">Seri: ${esc(i.serialNo)}</p>` : ''}
                  </div>
                  <span class="font-mono font-bold text-slate-900">${formatVND((i.price || i.unitPrice || 0) * i.quantity)}</span>
                </div>
              `).join('')}
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
              <span class="font-bold text-slate-800">Tổng thanh toán:</span>
              <span class="font-black font-mono text-[#DC2626] text-base">${formatVND(order.totalAmount || 0)}</span>
            </div>
          </div>
        `,
        maxWidth: '460px'
      });
    };
  });

  // 3. Hủy đơn
  document.querySelectorAll('.btn-cancel-order').forEach(btn => {
    btn.onclick = async () => {
      const orderId = Number(btn.dataset.orderId);
      const ok = await confirmDialog({
        title: 'Hủy đơn hàng',
        message: `Bạn có chắc chắn muốn hủy đơn hàng #DH${orderId} không?`,
        confirmText: 'Xác nhận hủy',
        cancelText: 'Giữ lại',
        danger: true
      });
      if (ok) {
        await mockService.updateOrderStatus(orderId, 'CANCELLED');
        const user = authStore.getClientUser();
        if (user) {
          myOrders = await mockService.getMyOrders(user);
        }
        if (currentGuestOrder && currentGuestOrder.id === orderId) {
          currentGuestOrder.status = 'CANCELLED';
        }
        toast.info(`Đã hủy đơn hàng #DH${orderId}`);
        renderMyOrders();
      }
    };
  });
}

initMyOrdersPage();
