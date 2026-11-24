/**
 * Script trang Thanh Toán (checkout.html)
 * Tuân thủ UI-05 (bắt buộc *, lỗi tiếng Việt nội dòng dưới input)
 * Tiện ích 1-Click sao chép STK / Cú pháp chuyển khoản VietQR cho mobile & desktop
 */
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { cartStore } from '../../shared/stores/cartStore.js';
import { authStore } from '../../shared/stores/authStore.js';
import { mockService } from '../../shared/services/mockService.js';
import { formatVND } from '../../shared/core/format.js';
import { esc } from '../../shared/core/dom.js';
import { toast } from '../../shared/ui/toast.js';
import { showFieldError, clearFieldError, validatePhone, copyToClipboard } from '../../shared/core/validate.js';
import { renderBackendGapBanner } from '../../shared/core/backendGaps.js';
import { apiClient } from '../../shared/services/apiClient.js';

let appliedCoupon = null;
let paymentMethod = 'COD'; // 'COD' | 'VIETQR'

export async function initCheckoutPage() {
  mountHeader();
  mountFooter();
  await cartStore.ensureLoaded();

  const items = cartStore.getItems();
  if (items.length === 0) {
    window.location.href = '/customer/pages/cart.html';
    return;
  }

  renderCheckout();
}

function renderCheckout() {
  const container = document.getElementById('checkout-page-container');
  if (!container) return;

  const curName = document.getElementById('checkout-name')?.value;
  const curPhone = document.getElementById('checkout-phone')?.value;
  const curEmail = document.getElementById('checkout-email')?.value;
  const curAddr = document.getElementById('checkout-address')?.value;
  const curNotes = document.getElementById('checkout-notes')?.value;

  const items = cartStore.getItems();
  const subtotal = cartStore.totalAmount();
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const user = authStore.getClientUser();

  const valName = curName !== undefined ? curName : (user?.fullName || '');
  const valPhone = curPhone !== undefined ? curPhone : (user?.phone || '');
  const valEmail = curEmail !== undefined ? curEmail : (user?.email || '');
  const valAddr = curAddr !== undefined ? curAddr : (user?.address || '');
  const valNotes = curNotes !== undefined ? curNotes : '';

  const transferContent = `DIENMAY ${valPhone ? valPhone.slice(-4) : (user?.phone ? user.phone.slice(-4) : 'PHAHANG')}`;

  container.innerHTML = `
    <div class="space-y-6 pb-16 max-w-5xl mx-auto">
      <!-- Tiêu đề -->
      <div class="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <i data-lucide="shield-check" class="w-6 h-6 text-[#DC2626]"></i>
            <span>Thông Tin Đặt Hàng & Thanh Toán</span>
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Giao hàng siêu tốc 2h - Miễn phí công thợ lắp đặt tận nơi tại Gia Lâm, Hà Nội
          </p>
        </div>

        <a href="/customer/pages/cart.html" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#DC2626] transition-colors">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Sửa giỏ hàng</span>
        </a>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Cột trái: Form người nhận & Phương thức thanh toán -->
        <div class="lg:col-span-7 space-y-6">
          <!-- Khối 1: Thông tin người nhận -->
          <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <i data-lucide="user" class="w-4 h-4 text-[#DC2626]"></i>
              <span>1. Thông Tin Người Nhận Hàng</span>
            </h3>

            <div class="space-y-3.5 text-xs">
              <div class="space-y-1">
                <label class="block font-bold text-slate-700">Họ và tên người nhận <span class="text-[#DC2626]">*</span>:</label>
                <input
                  type="text"
                  id="checkout-name"
                  value="${esc(valName)}"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  class="w-full h-10 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#DC2626] outline-hidden"
                  required
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block font-bold text-slate-700">Số điện thoại liên hệ <span class="text-[#DC2626]">*</span>:</label>
                  <input
                    type="tel"
                    id="checkout-phone"
                    value="${esc(valPhone)}"
                    placeholder="Ví dụ: 0988123456"
                    class="w-full h-10 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#DC2626] outline-hidden font-mono"
                    required
                  />
                </div>
                <div class="space-y-1">
                  <label class="block font-bold text-slate-700">Địa chỉ Email:</label>
                  <input
                    type="email"
                    id="checkout-email"
                    value="${esc(valEmail)}"
                    placeholder="nhanvien@phahang.vn"
                    class="w-full h-10 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#DC2626] outline-hidden"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="block font-bold text-slate-700">Địa chỉ giao hàng & Lắp đặt <span class="text-[#DC2626]">*</span>:</label>
                <input
                  type="text"
                  id="checkout-address"
                  value="${esc(valAddr)}"
                  placeholder="Ví dụ: Số 25, ngõ 8, đường Đình Xuyên, Gia Lâm, Hà Nội"
                  class="w-full h-10 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#DC2626] outline-hidden"
                  required
                />
              </div>

              <div class="space-y-1">
                <label class="block font-bold text-slate-700">Ghi chú cho kỹ thuật viên lắp đặt (nếu có):</label>
                <textarea
                  id="checkout-notes"
                  rows="2"
                  placeholder="Ví dụ: Lắp đặt tầng 2, cần mang theo thang dây và giá treo tivi..."
                  class="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#DC2626] outline-hidden"
                >${esc(valNotes)}</textarea>
              </div>
            </div>
          </div>

          <!-- Khối 2: Phương thức thanh toán (COD vs VietQR) -->
          <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <i data-lucide="credit-card" class="w-4 h-4 text-[#DC2626]"></i>
              <span>2. Phương Thức Thanh Toán</span>
            </h3>

            <div class="space-y-3 text-xs">
              <!-- Lựa chọn 1: COD -->
              <label class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#DC2626] bg-red-50/50' : 'border-slate-200 hover:bg-slate-50'}">
                <input type="radio" name="payment-method" value="COD" ${paymentMethod === 'COD' ? 'checked' : ''} class="mt-0.5 text-[#DC2626] focus:ring-[#DC2626]" />
                <div>
                  <div class="font-bold text-slate-900 flex items-center gap-2">
                    <span>Thanh toán khi nhận hàng & Lắp đặt (COD)</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Khuyên dùng</span>
                  </div>
                  <p class="text-slate-500 text-[11px] mt-0.5">
                    Kỹ thuật viên giao hàng tận nhà, cắm điện kiểm tra máy chạy êm mới thu tiền mặt hoặc quẹt thẻ.
                  </p>
                </div>
              </label>

              <!-- Lựa chọn 2: VietQR Chuyển khoản ngân hàng -->
              <label class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'VIETQR' ? 'border-[#DC2626] bg-red-50/50' : 'border-slate-200 hover:bg-slate-50'}">
                <input type="radio" name="payment-method" value="VIETQR" ${paymentMethod === 'VIETQR' ? 'checked' : ''} class="mt-0.5 text-[#DC2626] focus:ring-[#DC2626]" />
                <div>
                  <div class="font-bold text-slate-900 flex items-center gap-2">
                    <span>Chuyển khoản trực tuyến qua mã VietQR</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Quét mã 24/7</span>
                  </div>
                  <p class="text-slate-500 text-[11px] mt-0.5">
                    Quét mã QR bằng ứng dụng ngân hàng bất kỳ (MB, Vietcombank, Techcombank, BIDV...).
                  </p>
                </div>
              </label>
            </div>

            <!-- Khung quét mã VietQR tự động khi chọn VIETQR -->
            ${paymentMethod === 'VIETQR' ? `
              <div class="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3 animate-in fade-in duration-200">
                <div class="flex items-center justify-between text-xs font-bold text-amber-900">
                  <div class="flex items-center gap-2">
                    <i data-lucide="qr-code" class="w-4 h-4 text-amber-700"></i>
                    <span>Thông Tin Chuyển Khoản Showroom Pha Hằng</span>
                  </div>
                  <span class="text-[11px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">Tự động nhận diện</span>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-amber-100">
                  <div class="w-36 h-36 bg-white p-1 rounded-lg border border-slate-200 shrink-0 shadow-xs flex items-center justify-center">
                    <img
                      src="https://img.vietqr.io/image/MB-0988123456-compact2.png?amount=${finalTotal}&addInfo=${encodeURIComponent(transferContent)}&accountName=DIEN%20MAY%20PHA%20HANG"
                      alt="Mã VietQR Thanh Toán"
                      class="w-full h-full object-contain"
                    />
                  </div>

                  <div class="space-y-1.5 text-xs text-slate-700 font-medium flex-1 w-full">
                    <div class="flex items-center justify-between">
                      <span>Ngân hàng: <strong class="text-slate-900">MB Bank (Quân Đội)</strong></span>
                    </div>

                    <div class="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>Số tài khoản: <strong class="text-[#DC2626] font-mono text-sm">0988 123 456</strong></span>
                      <button
                        type="button"
                        id="btn-copy-stk"
                        class="px-2 py-1 rounded bg-slate-200 hover:bg-[#DC2626] hover:text-white text-[11px] font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <i data-lucide="copy" class="w-3 h-3"></i>
                        <span>Sao chép</span>
                      </button>
                    </div>

                    <p><span class="text-slate-500">Chủ tài khoản:</span> <strong class="text-slate-900 uppercase">CỬA HÀNG ĐIỆN MÁY PHA HẰNG</strong></p>

                    <div class="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>Số tiền: <strong class="text-[#DC2626] font-mono font-bold">${formatVND(finalTotal)}</strong></span>
                      <button
                        type="button"
                        id="btn-copy-amount"
                        class="px-2 py-1 rounded bg-slate-200 hover:bg-[#DC2626] hover:text-white text-[11px] font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <i data-lucide="copy" class="w-3 h-3"></i>
                        <span>Sao chép</span>
                      </button>
                    </div>

                    <div class="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>Nội dung CK: <strong class="font-mono text-slate-900">${esc(transferContent)}</strong></span>
                      <button
                        type="button"
                        id="btn-copy-syntax"
                        class="px-2 py-1 rounded bg-slate-200 hover:bg-[#DC2626] hover:text-white text-[11px] font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <i data-lucide="copy" class="w-3 h-3"></i>
                        <span>Sao chép</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Cột phải: Tóm tắt đơn hàng & Áp dụng Voucher -->
        <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Chi Tiết Đơn Hàng (${items.length} sp)</span>
              <i data-lucide="shopping-bag" class="w-4 h-4 text-slate-400"></i>
            </h3>

            <!-- Danh sách sp rút gọn -->
            <div class="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-2 text-xs">
              ${items.map(item => {
                const pName = item.productName || item.product?.name || 'Thiết bị điện máy';
                const pPrice = typeof item.price === 'number' ? item.price : (item.variant?.price || 0);
                const pImage = item.thumbnail || item.product?.images?.[0] || 'https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png';
                return `
                <div class="flex items-center gap-3 pt-2">
                  <div class="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 p-1 shrink-0">
                    <img src="${esc(pImage)}" alt="${esc(pName)}" class="w-full h-full object-contain" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-slate-900 truncate">${esc(pName)}</p>
                    <p class="text-[11px] text-slate-500 font-mono">SL: ${item.quantity} × ${formatVND(pPrice)}</p>
                  </div>
                  <span class="font-mono font-bold text-slate-900">
                    ${formatVND(pPrice * item.quantity)}
                  </span>
                </div>
              `;
              }).join('')}
            </div>

            <!-- Khung nhập mã giảm giá Voucher -->
            <div class="pt-3 border-t border-slate-100 space-y-2">
              <label class="block font-bold text-slate-800 text-xs">Mã giảm giá Voucher:</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  id="coupon-code-input"
                  placeholder="Nhập mã PHAHANG50K..."
                  value="${appliedCoupon ? appliedCoupon.code : ''}"
                  class="flex-1 h-9 px-3 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:border-[#DC2626] outline-hidden"
                  ${appliedCoupon ? 'disabled' : ''}
                />
                ${appliedCoupon ? `
                  <button type="button" id="btn-remove-coupon" class="px-3 h-9 rounded-xl border border-red-200 text-[#DC2626] hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer">
                    Hủy
                  </button>
                ` : `
                  <button type="button" id="btn-apply-coupon" class="px-4 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs">
                    Áp dụng
                  </button>
                `}
              </div>
              <p class="text-[11px] text-slate-400">Gợi ý: Dùng mã <strong class="text-[#DC2626] font-mono cursor-pointer" id="quick-voucher-btn">PHAHANG50K</strong> giảm ngay 50.000 ₫</p>
            </div>

            <!-- Tổng tiền -->
            <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div class="flex justify-between text-slate-600">
                <span>Tạm tính hàng hóa:</span>
                <span class="font-bold font-mono text-slate-900">${formatVND(subtotal)}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Phí vận chuyển & lắp đặt:</span>
                <span class="font-bold text-emerald-600">0 ₫ (Miễn phí)</span>
              </div>
              ${appliedCoupon ? `
                <div class="flex justify-between text-emerald-600 font-bold">
                  <span>Giảm giá Voucher (${esc(appliedCoupon.code)}):</span>
                  <span class="font-mono">-${formatVND(appliedCoupon.discountAmount)}</span>
                </div>
              ` : ''}
              <div class="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span class="text-xs sm:text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                <span class="text-xl sm:text-2xl font-black font-mono text-[#DC2626]">
                  ${formatVND(finalTotal)}
                </span>
              </div>
            </div>

            <!-- Nút Xác nhận đặt hàng -->
            <button
              type="button"
              id="btn-place-order"
              class="w-full py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-btn-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="check-circle-2" class="w-5 h-5"></i>
              <span>XÁC NHẬN ĐẶT HÀNG NGAY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindCheckoutEvents(finalTotal, transferContent);
  window.lucide?.createIcons();
}

function bindCheckoutEvents(finalTotal, transferContent) {
  // 1. Radio đổi phương thức thanh toán
  const radios = document.querySelectorAll('input[name="payment-method"]');
  radios.forEach(r => {
    r.onchange = () => {
      paymentMethod = r.value;
      renderCheckout();
    };
  });

  // 2. Click nút copy VietQR
  document.getElementById('btn-copy-stk')?.addEventListener('click', () => {
    copyToClipboard('0988123456', 'Đã sao chép Số tài khoản MB Bank (0988 123 456)!');
  });
  document.getElementById('btn-copy-amount')?.addEventListener('click', () => {
    copyToClipboard(String(finalTotal), `Đã sao chép số tiền: ${formatVND(finalTotal)}!`);
  });
  document.getElementById('btn-copy-syntax')?.addEventListener('click', () => {
    copyToClipboard(transferContent, `Đã sao chép cú pháp: ${transferContent}!`);
  });

  // 3. Click gợi ý voucher
  const quickBtn = document.getElementById('quick-voucher-btn');
  if (quickBtn) {
    quickBtn.onclick = () => {
      const input = document.getElementById('coupon-code-input');
      if (input) input.value = 'PHAHANG50K';
    };
  }

  // 4. Áp dụng voucher
  const applyBtn = document.getElementById('btn-apply-coupon');
  if (applyBtn) {
    applyBtn.onclick = async () => {
      const code = document.getElementById('coupon-code-input')?.value?.trim();
      if (!code) {
        toast.warning('Vui lòng nhập mã giảm giá!');
        return;
      }
      const res = await mockService.applyCoupon(code);
      if (res && res.valid) {
        appliedCoupon = { code: res.code, discountAmount: res.discountAmount };
        toast.success(`Đã áp dụng mã ${res.code}, giảm ${formatVND(res.discountAmount)}!`);
        renderCheckout();
      } else {
        toast.error(res?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
    };
  }

  // 5. Hủy voucher
  const removeBtn = document.getElementById('btn-remove-coupon');
  if (removeBtn) {
    removeBtn.onclick = () => {
      appliedCoupon = null;
      toast.info('Đã hủy áp dụng mã giảm giá');
      renderCheckout();
    };
  }

  // 6. Xóa lỗi khi gõ vào các ô input (UI-05)
  const nameInp = document.getElementById('checkout-name');
  const phoneInp = document.getElementById('checkout-phone');
  const addrInp = document.getElementById('checkout-address');

  [nameInp, phoneInp, addrInp].forEach(inp => {
    inp?.addEventListener('input', () => clearFieldError(inp));
  });

  // 7. Nút Xác nhận đặt hàng
  const placeOrderBtn = document.getElementById('btn-place-order');
  if (placeOrderBtn) {
    placeOrderBtn.onclick = async () => {
      clearFieldError(nameInp);
      clearFieldError(phoneInp);
      clearFieldError(addrInp);

      const name = nameInp?.value?.trim();
      const phone = phoneInp?.value?.trim();
      const address = addrInp?.value?.trim();
      const notes = document.getElementById('checkout-notes')?.value?.trim();

      let hasError = false;
      if (!name) {
        showFieldError(nameInp, 'Vui lòng nhập họ và tên người nhận hàng.');
        hasError = true;
      }
      if (!phone) {
        showFieldError(phoneInp, 'Vui lòng nhập số điện thoại nhận hàng.');
        hasError = true;
      } else if (!validatePhone(phone)) {
        showFieldError(phoneInp, 'Số điện thoại không hợp lệ (cần đúng 10 số đầu số VN).');
        hasError = true;
      }
      if (!address) {
        showFieldError(addrInp, 'Vui lòng nhập địa chỉ giao hàng và lắp đặt.');
        hasError = true;
      }

      if (hasError) return;

      const items = cartStore.getItems();
      const subtotal = cartStore.totalAmount();
      const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
      const finalTotalAmount = Math.max(0, subtotal - discountAmount);
      const user = authStore.getClientUser();

      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = `
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Đang khởi tạo đơn hàng...</span>
      `;

      try {
        const newOrder = await mockService.createOrder({
          userId: user?.id || null,
          customerName: name,
          receiverName: name,
          phone,
          receiverPhone: phone,
          address,
          shipAddress: address,
          notes,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          discountAmount,
          totalAmount: finalTotalAmount,
          items: items.map(i => ({
            productId: i.productId || i.product?.id,
            productName: i.productName || i.product?.name || 'Thiết bị điện máy',
            variantId: i.variantId,
            spec: i.variantSpec || i.variant?.spec || i.variant?.storage,
            variantInfo: [i.variantSpec || i.variant?.spec || i.variant?.storage, i.variantColor || i.variant?.color].filter(Boolean).join(' • '),
            color: i.variantColor || i.variant?.color,
            price: typeof i.price === 'number' ? i.price : (i.variant?.price || 0),
            unitPrice: typeof i.price === 'number' ? i.price : (i.variant?.price || 0),
            quantity: i.quantity,
            image: i.thumbnail || i.product?.images?.[0]
          }))
        });

        cartStore.clear();
        sessionStorage.setItem('last_created_order', JSON.stringify(newOrder));

        // Tích hợp đồng bộ phi chặn tới PaymentController Backend afa9fde (POST /order/payments)
        apiClient.createPayment({
          orderId: Number(String(newOrder.id).replace(/\D/g, '').slice(0, 8)) || 1,
          method: paymentMethod === 'COD' ? 'COD' : 'VIETQR',
          amount: finalTotalAmount,
          status: paymentMethod === 'COD' ? 'unpaid' : 'waiting'
        }).catch(() => {});

        window.location.href = `/customer/pages/order-success.html?orderId=${newOrder.id}`;
      } catch (err) {
        toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = '<span>XÁC NHẬN ĐẶT HÀNG NGAY</span>';
      }
    };
  }
}

initCheckoutPage();
