/**
 * Script trang Giỏ Hàng (cart.html)
 * Tái tạo 100% diện mạo và class Tailwind từ CartView.vue (commit 1a9e3c2)
 */
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { cartStore } from '../stores/cartStore.js';
import { formatVND } from '../core/format.js';
import { esc } from '../core/dom.js';
import { confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { renderBackendGapBanner } from '../core/backendGaps.js';

export async function initCartPage() {
  mountHeader();
  mountFooter();
  await cartStore.ensureLoaded();

  renderCart();

  cartStore.subscribe(() => {
    renderCart();
  });
}

function renderCart() {
  const container = document.getElementById('cart-page-container');
  if (!container) return;

  const items = cartStore.getItems();
  const totalAmount = cartStore.totalAmount();
  const count = cartStore.count();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto my-8 p-8">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center mb-4 border border-red-100">
          <i data-lucide="shopping-bag" class="w-8 h-8 text-[#DC2626]"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-900">Giỏ hàng của bạn đang trống</h3>
        <p class="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
          Khám phá các thiết bị điện tử, điện lạnh và đồ gia dụng chính hãng tại Cửa hàng Pha Hằng.
        </p>
        <div class="mt-6">
          <a href="/index.html" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#DC2626] text-white font-bold text-xs shadow-xs hover:bg-[#B91C1C] transition-colors">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            <span>Xem Danh Sách Sản Phẩm</span>
          </a>
        </div>
      </div>
    `;
    window.lucide?.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="space-y-6 pb-16">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <i data-lucide="shopping-bag" class="w-6 h-6 text-[#DC2626]"></i>
            <span>Giỏ Hàng Của Bạn</span>
            <span class="text-xs font-bold text-[#DC2626] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">${count} sản phẩm</span>
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Kiểm tra các sản phẩm đã chọn trước khi tiến hành bước thanh toán an toàn
          </p>
        </div>

        <a
          href="/index.html"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#DC2626] transition-colors"
        >
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Tiếp tục chọn mua</span>
        </a>
      </div>

      <!-- Grid 2 cột: Danh sách sản phẩm bên trái + Tóm tắt bên phải -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Cột sản phẩm -->
        <div class="lg:col-span-8 space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            ${items.map(item => {
              const pName = item.productName || item.product?.name || 'Thiết bị điện máy';
              const pPrice = typeof item.price === 'number' ? item.price : (item.variant?.price || 0);
              const pImage = item.thumbnail || item.product?.images?.[0] || 'https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png';
              const specText = item.variantSpec ? [item.variantSpec, item.variantColor].filter(Boolean).join(' • ') : [item.variant?.spec || item.variant?.storage, item.variant?.color].filter(Boolean).join(' • ');
              const maxStock = item.stockQty || item.variant?.stockQty || 99;
              const pId = item.productId || item.product?.id || '';
              return `
                <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/50">
                  <div class="flex items-center gap-4 flex-1 min-w-0">
                    <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 p-2 flex items-center justify-center">
                      <img
                        src="${esc(pImage)}"
                        alt="${esc(pName)}"
                        class="max-w-full max-h-full object-contain"
                        onerror="this.src='https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png'"
                      />
                    </div>

                    <div class="space-y-1 min-w-0">
                      <a href="/product-detail.html?id=${pId}" class="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#DC2626] transition-colors line-clamp-2 leading-tight">
                        ${esc(pName)}
                      </a>
                      ${specText ? `
                        <p class="text-[11px] font-semibold text-slate-500">
                          Quy cách: <span class="text-slate-800">${esc(specText)}</span>
                        </p>
                      ` : ''}
                      <p class="text-xs font-black font-mono text-[#DC2626]">
                        ${formatVND(pPrice)}
                      </p>
                    </div>
                  </div>

                  <!-- Số lượng & Nút Xóa -->
                  <div class="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div class="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <button
                        type="button"
                        class="btn-cart-dec w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer font-bold"
                        data-variant-id="${item.variantId}"
                        data-qty="${item.quantity}"
                      >-</button>
                      <span class="w-10 h-8 flex items-center justify-center font-mono font-bold text-xs border-x border-slate-200">
                        ${item.quantity}
                      </span>
                      <button
                        type="button"
                        class="btn-cart-inc w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer font-bold"
                        data-variant-id="${item.variantId}"
                        data-qty="${item.quantity}"
                        data-max="${maxStock}"
                      >+</button>
                    </div>

                    <div class="text-right min-w-[90px]">
                      <span class="text-xs sm:text-sm font-black font-mono text-slate-900 block">
                        ${formatVND(pPrice * item.quantity)}
                      </span>
                    </div>

                    <button
                      type="button"
                      class="btn-cart-del p-2 rounded-xl text-slate-400 hover:text-[#DC2626] hover:bg-red-50 transition-colors cursor-pointer"
                      data-variant-id="${item.variantId}"
                      data-name="${esc(pName)}"
                      title="Xóa sản phẩm"
                    >
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Nút xóa toàn bộ giỏ hàng -->
          <div class="flex justify-between items-center text-xs px-2">
            <button
              type="button"
              id="btn-clear-cart"
              class="text-slate-500 hover:text-[#DC2626] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Xóa toàn bộ giỏ hàng</span>
            </button>
            <span class="text-slate-400">Giao hàng và lắp đặt miễn phí tại Gia Lâm</span>
          </div>
        </div>

        <!-- Cột tóm tắt đơn hàng bên phải (Summary Box) -->
        <div class="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 sticky top-24">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Tóm Tắt Đơn Hàng</span>
            <i data-lucide="receipt" class="w-4 h-4 text-slate-400"></i>
          </h3>

          <div class="space-y-3 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Tạm tính hàng hóa:</span>
              <span class="font-bold font-mono text-slate-900">${formatVND(totalAmount)}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Phí vận chuyển & lắp đặt:</span>
              <span class="font-bold text-emerald-600">Miễn phí 100%</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Bảo hành tận nhà:</span>
              <span class="font-bold text-emerald-600">2 Năm chu đáo</span>
            </div>
            <div class="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span class="text-xs sm:text-sm font-bold text-slate-900">Tổng thanh toán:</span>
              <span class="text-xl sm:text-2xl font-black font-mono text-[#DC2626]">
                ${formatVND(totalAmount)}
              </span>
            </div>
          </div>

          <a href="/checkout.html" class="block w-full">
            <button
              type="button"
              class="w-full py-3.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black text-sm rounded-2xl shadow-btn-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>TIẾN HÀNH ĐẶT HÀNG</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </a>

          <!-- Cam kết dịch vụ -->
          <div class="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
            <div class="flex items-center gap-2">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
              <span>Kiểm tra hàng và chạy thử trước khi thanh toán</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4 text-[#DC2626] shrink-0"></i>
              <span>Lỗi 1 đổi 1 trong 30 ngày tận nhà nếu có lỗi NSX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  bindCartEvents();
  window.lucide?.createIcons();
}

function bindCartEvents() {
  // 1. Tăng số lượng
  document.querySelectorAll('.btn-cart-inc').forEach(btn => {
    btn.onclick = () => {
      const vId = Number(btn.dataset.variantId);
      const currentQty = Number(btn.dataset.qty);
      const max = Number(btn.dataset.max) || 99;
      if (currentQty >= max) {
        toast.warning(`Kho chỉ còn sẵn ${max} sản phẩm!`);
        return;
      }
      cartStore.updateQuantity(vId, currentQty + 1);
    };
  });

  // 2. Giảm số lượng
  document.querySelectorAll('.btn-cart-dec').forEach(btn => {
    btn.onclick = async () => {
      const vId = Number(btn.dataset.variantId);
      const currentQty = Number(btn.dataset.qty);
      if (currentQty <= 1) {
        const ok = await confirmDialog({
          title: 'Xóa khỏi giỏ hàng',
          message: 'Bạn có chắc chắn muốn bỏ sản phẩm này ra khỏi giỏ hàng?',
          confirmText: 'Xác nhận xóa',
          cancelText: 'Giữ lại',
          danger: true
        });
        if (ok) {
          cartStore.removeItem(vId);
          toast.info('Đã xóa sản phẩm khỏi giỏ hàng');
        }
      } else {
        cartStore.updateQuantity(vId, currentQty - 1);
      }
    };
  });

  // 3. Xóa sản phẩm
  document.querySelectorAll('.btn-cart-del').forEach(btn => {
    btn.onclick = async () => {
      const vId = Number(btn.dataset.variantId);
      const name = btn.dataset.name;
      const ok = await confirmDialog({
        title: 'Xác nhận xóa sản phẩm',
        message: `Bạn có muốn bỏ sản phẩm "${name}" khỏi giỏ hàng?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        danger: true
      });
      if (ok) {
        cartStore.removeItem(vId);
        toast.info('Đã xóa sản phẩm');
      }
    };
  });

  // 4. Xóa toàn bộ giỏ hàng
  const clearBtn = document.getElementById('btn-clear-cart');
  if (clearBtn) {
    clearBtn.onclick = async () => {
      const ok = await confirmDialog({
        title: 'Xóa toàn bộ giỏ hàng',
        message: 'Bạn có chắc chắn muốn dọn sạch tất cả sản phẩm trong giỏ hàng không?',
        confirmText: 'Làm rỗng giỏ',
        cancelText: 'Giữ lại',
        danger: true
      });
      if (ok) {
        cartStore.clear();
        toast.info('Đã xóa toàn bộ sản phẩm trong giỏ hàng');
      }
    };
  }
}

// Khởi tạo
initCartPage();
