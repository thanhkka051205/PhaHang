/**
 * Script Chi tiết sản phẩm (product-detail.html)
 * Chuẩn BA Điện máy Pha Hằng:
 * - Cập nhật cục bộ DOM (patching) khi đổi phiên bản / ảnh, loại bỏ 100% hiện tượng flicker/re-render.
 * - Hỗ trợ đầy đủ biến thể: Dung tích / Kích thước / Công suất / Màu sắc.
 * - Tự động đồng bộ giá bán, giá niêm yết, bảng thông số kỹ thuật và modal trả góp 0%.
 * - Bổ sung Mobile Sticky Bottom Bar đặt hàng chuẩn UI-02 (giá + Thêm giỏ + Mua ngay).
 * - Bổ sung Lightbox Modal phóng to ảnh sản phẩm điện máy.
 */
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { mockService } from '../../shared/services/mockService.js';
import { formatVND } from '../../shared/core/format.js';
import { esc, getQueryParam } from '../../shared/core/dom.js';
import { cartStore } from '../../shared/stores/cartStore.js';
import { toast } from '../../shared/ui/toast.js';
import { openModal } from '../../shared/ui/modal.js';
import { renderGapBadge, renderMissingImageBox } from '../../shared/core/backendGaps.js';

let product = null;
let selectedVariant = null;
let activeImageIndex = 0;
let quantity = 1;

export async function initProductDetailPage() {
  mountHeader();
  mountFooter();
  await cartStore.ensureLoaded();

  const id = Number(getQueryParam('id'));
  if (!id) {
    renderNotFound();
    return;
  }

  product = await mockService.getProductById(id);
  if (!product) {
    renderNotFound();
    return;
  }

  selectedVariant = product.variants?.[0] || null;
  activeImageIndex = 0;
  quantity = 1;

  renderInitialDetail();
}

function renderNotFound() {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
      <div class="w-16 h-16 rounded-2xl bg-red-50 text-[#DC2626] flex items-center justify-center mx-auto mb-4 border border-red-100">
        <i data-lucide="package-x" class="w-8 h-8"></i>
      </div>
      <h2 class="text-lg font-bold text-slate-800 mb-2">Không tìm thấy sản phẩm này</h2>
      <p class="text-xs text-slate-500 mb-6">Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.</p>
      <a href="/customer/pages/home.html" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#DC2626] text-white font-bold text-xs shadow-xs hover:bg-[#B91C1C] transition-colors">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Về trang chủ</span>
      </a>
    </div>
  `;
  window.lucide?.createIcons();
}

function renderInitialDetail() {
  const container = document.getElementById('product-detail-container');
  if (!container || !product) return;

  const currentImage = product.images?.[activeImageIndex] || product.images?.[0] || 'https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png';

  const specs = [...new Set(product.variants?.map(v => v.spec || v.storage).filter(Boolean))];
  const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))];

  const categoryNameMap = {
    1: 'Ti vi',
    2: 'Điều hòa',
    3: 'Tủ lạnh',
    4: 'Quạt',
    5: 'Nồi cơm điện',
    6: 'Smart Tivi 4K',
    7: 'Tivi OLED & QLED',
    8: 'Điều hòa 1 chiều Inverter',
    9: 'Điều hòa 2 chiều Inverter',
    10: 'Tủ lạnh Ngăn đá trên',
    11: 'Tủ lạnh Side by Side',
    12: 'Tủ lạnh Mini',
    13: 'Quạt đứng & Quạt cây',
    14: 'Quạt treo tường',
    15: 'Quạt điều hòa hơi nước',
    16: 'Nồi cơm điện tử',
    17: 'Nồi cơm cao tần (IH)',
    18: 'Nồi cơm điện cơ'
  };
  const catName = categoryNameMap[product.categoryId] || 'Thiết bị gia dụng';

  // Xác định nhãn hiển thị biến thể thông minh theo ngành hàng
  let specLabel = 'Phiên bản / Quy cách:';
  const catId = Number(product.categoryId);
  if ([1, 6, 7].includes(catId) || specs.some(s => /inch|màn hình/i.test(s))) {
    specLabel = 'Kích thước màn hình:';
  } else if ([2, 8, 9].includes(catId) || specs.some(s => /btu|hp|ngựa/i.test(s))) {
    specLabel = 'Công suất làm lạnh:';
  } else if ([3, 10, 11, 12].includes(catId) || specs.some(s => /lít|\bl\b/i.test(s))) {
    specLabel = 'Dung tích tủ:';
  } else if ([5, 16, 17, 18].includes(catId)) {
    specLabel = 'Dung tích nồi:';
  } else if ([4, 13, 14, 15].includes(catId)) {
    specLabel = 'Loại quạt / Công suất:';
  }

  container.innerHTML = `
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
      <a href="/customer/pages/home.html" class="hover:text-[#DC2626] transition-colors">Trang chủ</a>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
      <a href="/customer/pages/home.html?category=${product.categoryId}" class="hover:text-[#DC2626] transition-colors">${esc(catName)}</a>
      <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
      <span class="text-slate-800 font-bold truncate max-w-xs sm:max-w-md">${esc(product.name)}</span>
    </nav>

    <!-- BỐ CỤC CHUẨN XÁC WIREFRAME HÌNH 12 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20 lg:pb-0">
      
      <!-- CỘT TRÁI: ẢNH CHÍNH, THUMBNAIL & ĐẶC ĐIỂM NỔI BẬT -->
      <div class="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <!-- Ảnh chính cỡ lớn có thể bấm xem phóng to -->
          <div
            id="main-image-wrapper"
            class="relative w-full aspect-square bg-[#F8FAFC] rounded-2xl p-6 border border-slate-100 overflow-hidden flex items-center justify-center cursor-zoom-in group"
            title="Bấm để xem ảnh phóng to chi tiết"
          >
            <img
              id="main-product-image"
              src="${esc(currentImage)}"
              alt="${esc(product.name)}"
              class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onerror="this.onerror=null;this.src='https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png'"
            />
            <!-- Badges góc trên bên trái: Thương hiệu & Giảm giá -->
            <div class="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
              <span class="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900 text-white shadow-xs">
                ${esc(product.brand)}
              </span>
              <span id="badge-discount" class="px-2 py-0.5 rounded text-[10px] font-black bg-[#DC2626] text-white shadow-xs hidden">
                -0%
              </span>
            </div>

            <!-- Badges góc trên bên phải: Bảo hành & Trả góp / Quản lý Seri -->
            <div class="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
              <div class="flex items-center gap-1.5">
                ${product.warrantyMonths ? `
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                    BH ${product.warrantyMonths}T
                  </span>
                ` : ''}
                ${product.trackSerial ? `
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-xs" title="Sản phẩm quản lý theo số Seri chính hãng">
                    Quản lý Seri
                  </span>
                ` : `
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                    Trả góp 0%
                  </span>
                `}
                <div class="w-7 h-7 rounded-lg bg-black/40 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Dải ảnh nhỏ Thumbnail -->
          ${product.images?.length > 1 ? `
            <div class="grid grid-cols-4 gap-2.5" id="thumbnail-grid">
              ${product.images.map((img, idx) => `
                <button
                  type="button"
                  class="thumb-btn aspect-square rounded-xl overflow-hidden border-2 transition-all bg-white p-1 cursor-pointer ${idx === activeImageIndex ? 'border-[#DC2626] shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'}"
                  data-index="${idx}"
                >
                  <img src="${esc(img)}" alt="Ảnh ${idx + 1}" class="w-full h-full object-contain" />
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Khối Đặc điểm nổi bật -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <i data-lucide="sparkles" class="w-4 h-4 text-[#DC2626]"></i>
            <span>Đặc Điểm Nổi Bật Thiết Bị</span>
          </h4>
          <ul class="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0"></div>
              <span>Công nghệ Inverter tiết kiệm điện năng vượt trội, vận hành êm ái, bền bỉ theo thời gian.</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0"></div>
              <span>Chính sách bảo hành điện tử chính hãng <strong class="text-slate-800">${product.warrantyMonths || 24} tháng</strong> kích hoạt qua số seri điện tử.</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-[#DC2626] mt-1.5 shrink-0"></div>
              <span>Hỗ trợ kỹ thuật viên chuyên nghiệp lắp đặt tận nơi tại nhà, hướng dẫn vận hành chi tiết.</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- CỘT PHẢI: THÔNG TIN VÀ CẤU HÌNH -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
        
        <!-- Tên sản phẩm & Đánh giá -->
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-md bg-red-50 text-[#DC2626] text-xs font-bold">
              ${esc(product.brand)} · Chính Hãng
            </span>
            <div class="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-400"></i>
              <span>${product.promo?.rating || '5.0'}</span>
              <span class="text-slate-400 font-normal">(${product.promo?.reviewCount || 48} đánh giá thực tế)</span>
            </div>
            <span class="text-xs text-slate-400 font-mono ml-auto">Mã SP: #${product.id}</span>
          </div>

          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            ${esc(product.name)}
          </h1>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">
            ${esc(product.description || 'Sản phẩm điện máy chính hãng tại Cửa Hàng Pha Hằng, đầy đủ tem mác xuất xưởng.')}
          </p>
        </div>

        <!-- 1. Chọn Quy cách / Kích thước / Công suất / Dung tích -->
        ${specs.length > 0 ? `
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              ${esc(specLabel)}
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="spec-options-grid">
              ${specs.map(sp => {
                const isSelected = (selectedVariant?.spec || selectedVariant?.storage) === sp;
                const v = product.variants.find(x => (x.spec || x.storage) === sp);
                return `
                  <button
                    type="button"
                    class="spec-btn p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected ? 'bg-red-50/70 border-[#DC2626] text-[#DC2626] ring-1 ring-[#DC2626]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}"
                    data-spec="${esc(sp)}"
                  >
                    <span class="text-xs font-bold">${esc(sp)}</span>
                    <span class="text-[11px] font-mono mt-0.5 ${isSelected ? 'font-bold text-[#DC2626]' : 'text-slate-500'}">
                      ${formatVND(v?.price || 0)}
                    </span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 2. Chọn Màu sắc (nếu có) -->
        ${colors.length > 0 ? `
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Màu sắc thiết bị:
            </label>
            <div class="flex flex-wrap gap-2" id="color-options-wrap">
              ${colors.map(col => {
                const isSelected = selectedVariant?.color === col;
                return `
                  <button
                    type="button"
                    class="color-btn px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${isSelected ? 'bg-red-50 border-[#DC2626] text-[#DC2626] font-bold ring-1 ring-[#DC2626]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}"
                    data-color="${esc(col)}"
                  >
                    <span class="w-3 h-3 rounded-full border border-slate-300" style="background-color: ${col.toLowerCase().includes('đen') ? '#000' : col.toLowerCase().includes('trắng') ? '#fff' : col.toLowerCase().includes('bạc') ? '#ccc' : col.toLowerCase().includes('vàng') ? '#d4af37' : col.toLowerCase().includes('xám') ? '#6b7280' : '#e2e8f0'};"></span>
                    <span>${esc(col)}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 3. Khối hiển thị Giá tiền & Khuyến mãi (Chuẩn SRS UI-04) -->
        <div class="bg-red-50/50 border border-red-100 rounded-2xl p-4 sm:p-5 space-y-3">
          <div class="flex flex-wrap items-baseline gap-3">
            <span id="price-display-main" class="text-2xl sm:text-3xl font-black font-mono text-[#DC2626]">
              ${formatVND(selectedVariant?.price || product.price)}
            </span>
            <span id="price-display-list" class="text-sm sm:text-base text-slate-400 line-through font-mono hidden">
              0 ₫
            </span>
            <span id="price-display-save" class="text-xs font-black bg-[#DC2626] text-white px-2 py-0.5 rounded shadow-xs hidden">
              Tiết kiệm 0 ₫
            </span>
          </div>

          <!-- Quà tặng kèm theo (promo.gift) -->
          ${product.promo?.gift ? `
            <div class="p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-2 text-xs text-amber-900">
              <i data-lucide="gift" class="w-4 h-4 text-amber-600 mt-0.5 shrink-0"></i>
              <div>
                <span class="font-bold text-amber-800">Quà tặng đặc biệt:</span>
                <span class="font-medium ml-1">${esc(product.promo.gift)}</span>
              </div>
            </div>
          ` : ''}

          <div class="flex items-center gap-2 pt-2 border-t border-red-100/60 text-xs text-[#DC2626] font-semibold">
            <i data-lucide="sparkles" class="w-4 h-4 shrink-0"></i>
            <span>Thành viên Pha Hằng được giảm thêm 300.000 ₫ khi mua tại Showroom Đình Xuyên</span>
          </div>
        </div>

        <!-- 4. Số lượng & Nút Mua hàng Desktop -->
        <div class="space-y-4 pt-2">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Số lượng:</span>
            <div class="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button type="button" id="btn-qty-dec" class="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer font-bold">-</button>
              <input type="number" id="input-qty" value="${quantity}" min="1" class="w-12 h-9 text-center font-mono font-bold text-xs border-x border-slate-200 outline-hidden" readonly />
              <button type="button" id="btn-qty-inc" class="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer font-bold">+</button>
            </div>
            <span id="stock-display" class="text-xs text-slate-500 font-medium">
              (Còn ${selectedVariant?.stockQty || 15} sản phẩm sẵn có)
            </span>
          </div>

          <!-- Nút MUA NGAY & THÊM VÀO GIỎ -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              id="btn-buy-now"
              class="w-full py-3.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-btn-brand cursor-pointer font-extrabold text-sm sm:text-base rounded-2xl transition-all flex flex-col items-center justify-center"
            >
              <span>MUA NGAY</span>
              <span class="text-[11px] font-normal opacity-90">Giao hàng và lắp đặt siêu tốc 2h</span>
            </button>

            <button
              type="button"
              id="btn-add-to-cart"
              class="w-full py-3.5 border-2 border-[#DC2626] text-[#DC2626] hover:bg-red-50 cursor-pointer font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <i data-lucide="shopping-bag" class="w-4 h-4"></i>
              <span>THÊM VÀO GIỎ HÀNG</span>
            </button>
          </div>
          </div>

          <!-- Nút TRẢ GÓP 0% MỞ MODAL (BR-10) -->
          <button
            type="button"
            id="btn-open-installment"
            class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="credit-card" class="w-4 h-4"></i>
            <span>TRẢ GÓP 0% LÃI SUẤT - DUYỆT HỒ SƠ 5 PHÚT</span>
          </button>
        </div>

        <!-- 5. Bảng thông số kỹ thuật chi tiết chuẩn BA -->
        <div class="pt-6 border-t border-slate-100 space-y-3">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <i data-lucide="cpu" class="w-4 h-4 text-[#DC2626]"></i>
            <span>Thông Số Kỹ Thuật Chi Tiết (Chuẩn BA)</span>
          </h3>
          <div class="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div class="grid grid-cols-3 p-3 bg-slate-50 font-medium">
              <span class="text-slate-500">Mã sản phẩm (ID):</span>
              <span class="col-span-2 font-bold font-mono text-slate-800">#${product.id}</span>
            </div>
            <div class="grid grid-cols-3 p-3 font-medium">
              <span class="text-slate-500">Mã biến thể (SKU):</span>
              <span id="table-variant-sku" class="col-span-2 font-bold font-mono text-[#DC2626]">SKU-${selectedVariant?.id || product.id}</span>
            </div>
            <div class="grid grid-cols-3 p-3 bg-slate-50 font-medium">
              <span class="text-slate-500">Ngành hàng / Danh mục:</span>
              <span class="col-span-2 font-bold text-slate-800">${esc(catName)}</span>
            </div>
            <div class="grid grid-cols-3 p-3 font-medium">
              <span class="text-slate-500">Thương hiệu (Hãng):</span>
              <span class="col-span-2 font-bold text-slate-800">${esc(product.brand)}</span>
            </div>
            <div class="grid grid-cols-3 p-3 bg-slate-50 font-medium">
              <span class="text-slate-500">Quy cách / Phiên bản:</span>
              <span id="table-variant-spec" class="col-span-2 font-bold text-slate-800">${esc(selectedVariant?.spec || selectedVariant?.storage || 'Tiêu chuẩn')}</span>
            </div>
            <div class="grid grid-cols-3 p-3 font-medium">
              <span class="text-slate-500">Màu sắc thiết bị:</span>
              <span id="table-variant-color" class="col-span-2 font-bold text-slate-800">${esc(selectedVariant?.color || 'Mặc định')}</span>
            </div>
            <div class="grid grid-cols-3 p-3 bg-slate-50 font-medium">
              <span class="text-slate-500">Thời hạn bảo hành:</span>
              <span class="col-span-2 font-bold text-slate-800">${product.warrantyMonths ? `${product.warrantyMonths} Tháng chính hãng` : 'Theo chính sách hãng'}</span>
            </div>
            <div class="grid grid-cols-3 p-3 font-medium">
              <span class="text-slate-500">Quản lý theo Số Seri:</span>
              <span class="col-span-2 font-bold ${product.trackSerial ? 'text-blue-600' : 'text-slate-600'}">
                ${product.trackSerial ? 'Có (Quản lý và kích hoạt qua số Seri điện tử)' : 'Không quản lý Seri'}
              </span>
            </div>
            <div class="grid grid-cols-3 p-3 bg-slate-50 font-medium">
              <span class="text-slate-500">Trạng thái kinh doanh:</span>
              <span class="col-span-2 font-bold ${product.isVisible !== false ? 'text-emerald-600' : 'text-slate-400'}">
                ${product.isVisible !== false ? 'Đang kinh doanh' : 'Tạm ẩn / Ngừng kinh doanh'}
              </span>
            </div>
            <div class="grid grid-cols-3 p-3 font-medium">
              <span class="text-slate-500">Tình trạng máy:</span>
              <span class="col-span-2 font-bold text-emerald-600">Mới 100% nguyên đai nguyên kiện</span>
            </div>
            <div class="grid grid-cols-3 p-3 bg-slate-50 font-medium">
              <span class="text-slate-500">Bộ sản phẩm bao gồm:</span>
              <span class="col-span-2 font-bold text-slate-800">Thân máy, phụ kiện chuẩn, sách hướng dẫn, phiếu bảo hành</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 6. MOBILE STICKY BOTTOM BAR (UI-02) -->
    <div
      id="mobile-sticky-buy-bar"
      class="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2.5"
    >
      <div class="min-w-0 flex-1">
        <p id="sticky-variant-title" class="text-[11px] text-slate-500 truncate font-semibold">
          ${esc(selectedVariant?.spec || selectedVariant?.storage || '')} ${esc(selectedVariant?.color || '')}
        </p>
        <p id="sticky-price" class="text-base font-black font-mono text-[#DC2626] leading-tight">
          ${formatVND(selectedVariant?.price || 0)}
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          id="btn-sticky-add-cart"
          class="h-10 px-3 rounded-xl border border-[#DC2626] text-[#DC2626] bg-red-50/50 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
          title="Thêm vào giỏ"
        >
          <i data-lucide="shopping-bag" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Thêm giỏ</span>
        </button>

        <button
          type="button"
          id="btn-sticky-buy-now"
          class="h-10 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs shadow-btn-brand flex items-center justify-center cursor-pointer transition-colors"
        >
          <span>MUA NGAY</span>
        </button>
      </div>
    </div>
  `;

  bindInitialEvents();
  patchProductUI();
  window.lucide?.createIcons();
}

/**
 * Patch DOM cục bộ cực nhanh, không gây flicker hoặc re-render innerHTML
 */
function patchProductUI() {
  if (!product || !selectedVariant) return;

  const currentPrice = selectedVariant.price || 0;
  const listPrice = selectedVariant.listPrice || null;
  const discountPercent = (listPrice && listPrice > currentPrice)
    ? Math.round(((listPrice - currentPrice) / listPrice) * 100)
    : null;
  const isOutOfStock = (selectedVariant.stockQty || 0) <= 0;

  // 1. Cập nhật ảnh chính
  const mainImg = document.getElementById('main-product-image');
  const currentImgUrl = product.images?.[activeImageIndex] || product.images?.[0];
  if (mainImg && currentImgUrl) {
    mainImg.src = currentImgUrl;
  }

  // 2. Cập nhật thumbnail borders
  document.querySelectorAll('.thumb-btn').forEach((btn, idx) => {
    if (idx === activeImageIndex) {
      btn.className = 'thumb-btn aspect-square rounded-xl overflow-hidden border-2 border-[#DC2626] shadow-xs transition-all bg-white p-1 cursor-pointer';
    } else {
      btn.className = 'thumb-btn aspect-square rounded-xl overflow-hidden border-2 border-slate-200 opacity-70 hover:opacity-100 transition-all bg-white p-1 cursor-pointer';
    }
  });

  // 3. Cập nhật các nút phiên bản (Spec/Dung tích/Công suất)
  document.querySelectorAll('.spec-btn').forEach(btn => {
    const sp = btn.dataset.spec;
    const isSelected = (selectedVariant.spec || selectedVariant.storage) === sp;
    if (isSelected) {
      btn.className = 'spec-btn p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between bg-red-50/70 border-[#DC2626] text-[#DC2626] ring-1 ring-[#DC2626]';
      btn.querySelector('.font-mono')?.classList.add('font-bold', 'text-[#DC2626]');
      btn.querySelector('.font-mono')?.classList.remove('text-slate-500');
    } else {
      btn.className = 'spec-btn p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
      btn.querySelector('.font-mono')?.classList.remove('font-bold', 'text-[#DC2626]');
      btn.querySelector('.font-mono')?.classList.add('text-slate-500');
    }
  });

  // 4. Cập nhật các nút màu sắc
  document.querySelectorAll('.color-btn').forEach(btn => {
    const col = btn.dataset.color;
    const isSelected = selectedVariant.color === col;
    if (isSelected) {
      btn.className = 'color-btn px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-red-50 border-[#DC2626] text-[#DC2626] font-bold ring-1 ring-[#DC2626]';
    } else {
      btn.className = 'color-btn px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
    }
  });

  // 5. Cập nhật giá bán và giảm giá
  const mainPriceEl = document.getElementById('price-display-main');
  const listPriceEl = document.getElementById('price-display-list');
  const savePriceEl = document.getElementById('price-display-save');
  const badgeDiscount = document.getElementById('badge-discount');

  if (mainPriceEl) mainPriceEl.textContent = formatVND(currentPrice);

  if (listPrice && listPrice > currentPrice) {
    if (listPriceEl) {
      listPriceEl.textContent = formatVND(listPrice);
      listPriceEl.classList.remove('hidden');
    }
    if (savePriceEl) {
      savePriceEl.textContent = `Tiết kiệm ${formatVND(listPrice - currentPrice)}`;
      savePriceEl.classList.remove('hidden');
    }
    if (badgeDiscount && discountPercent) {
      badgeDiscount.textContent = `-${discountPercent}%`;
      badgeDiscount.classList.remove('hidden');
    }
  } else {
    listPriceEl?.classList.add('hidden');
    savePriceEl?.classList.add('hidden');
    badgeDiscount?.classList.add('hidden');
  }

  // 6. Cập nhật tồn kho & Trạng thái nút mua
  const stockEl = document.getElementById('stock-display');
  if (stockEl) {
    stockEl.textContent = isOutOfStock
      ? '(Tạm thời hết hàng)'
      : `(Còn ${selectedVariant.stockQty || 0} sản phẩm sẵn có)`;
  }

  const btnBuyNow = document.getElementById('btn-buy-now');
  const btnAddToCart = document.getElementById('btn-add-to-cart');
  const btnStickyBuy = document.getElementById('btn-sticky-buy-now');
  const btnStickyAdd = document.getElementById('btn-sticky-add-cart');

  if (isOutOfStock) {
    if (btnBuyNow) {
      btnBuyNow.disabled = true;
      btnBuyNow.classList.add('opacity-50', 'pointer-events-none');
      btnBuyNow.innerHTML = '<span>TẠM HẾT HÀNG</span>';
    }
    if (btnAddToCart) {
      btnAddToCart.disabled = true;
      btnAddToCart.classList.add('opacity-50', 'pointer-events-none');
    }
    if (btnStickyBuy) {
      btnStickyBuy.disabled = true;
      btnStickyBuy.classList.add('opacity-50', 'pointer-events-none');
      btnStickyBuy.textContent = 'HẾT HÀNG';
    }
    if (btnStickyAdd) {
      btnStickyAdd.disabled = true;
      btnStickyAdd.classList.add('opacity-50', 'pointer-events-none');
    }
  } else {
    if (btnBuyNow) {
      btnBuyNow.disabled = false;
      btnBuyNow.classList.remove('opacity-50', 'pointer-events-none');
      btnBuyNow.innerHTML = '<span>MUA NGAY</span><span class="text-[11px] font-normal opacity-90">Giao hàng và lắp đặt siêu tốc 2h</span>';
    }
    if (btnAddToCart) {
      btnAddToCart.disabled = false;
      btnAddToCart.classList.remove('opacity-50', 'pointer-events-none');
    }
    if (btnStickyBuy) {
      btnStickyBuy.disabled = false;
      btnStickyBuy.classList.remove('opacity-50', 'pointer-events-none');
      btnStickyBuy.textContent = 'MUA NGAY';
    }
    if (btnStickyAdd) {
      btnStickyAdd.disabled = false;
      btnStickyAdd.classList.remove('opacity-50', 'pointer-events-none');
    }
  }

  // 7. Cập nhật Bảng Thông Số Kỹ Thuật (Reactive specs table)
  const skuEl = document.getElementById('table-variant-sku');
  const specEl = document.getElementById('table-variant-spec');
  const colorEl = document.getElementById('table-variant-color');
  if (skuEl) skuEl.textContent = `SKU-${selectedVariant.id}`;
  if (specEl) specEl.textContent = selectedVariant.spec || selectedVariant.storage || 'Tiêu chuẩn';
  if (colorEl) colorEl.textContent = selectedVariant.color || 'Mặc định';

  // 8. Cập nhật Mobile Sticky Bar
  const stickyTitle = document.getElementById('sticky-variant-title');
  const stickyPrice = document.getElementById('sticky-price');
  if (stickyTitle) {
    const specText = [selectedVariant.spec || selectedVariant.storage, selectedVariant.color].filter(Boolean).join(' • ');
    stickyTitle.textContent = specText || product.name;
  }
  if (stickyPrice) {
    stickyPrice.textContent = formatVND(currentPrice);
  }
}

function bindInitialEvents() {
  // 1. Click Thumbnails
  const thumbGrid = document.getElementById('thumbnail-grid');
  if (thumbGrid) {
    thumbGrid.onclick = (e) => {
      const btn = e.target.closest('.thumb-btn');
      if (!btn) return;
      activeImageIndex = Number(btn.dataset.index) || 0;
      patchProductUI();
    };
  }

  // 2. Click Specs (Kích thước / Công suất / Dung tích)
  const specGrid = document.getElementById('spec-options-grid');
  if (specGrid) {
    specGrid.onclick = (e) => {
      const btn = e.target.closest('.spec-btn');
      if (!btn) return;
      const sp = btn.dataset.spec;
      
      // Ưu tiên chọn variant khớp spec mới VÀ cùng color đang chọn
      let v = product.variants.find(x => (x.spec || x.storage) === sp && x.color === selectedVariant?.color);
      if (!v) {
        v = product.variants.find(x => (x.spec || x.storage) === sp);
      }
      if (v) {
        selectedVariant = v;
        patchProductUI();
      }
    };
  }

  // 3. Click Colors
  const colorWrap = document.getElementById('color-options-wrap');
  if (colorWrap) {
    colorWrap.onclick = (e) => {
      const btn = e.target.closest('.color-btn');
      if (!btn) return;
      const col = btn.dataset.color;
      
      // Ưu tiên chọn variant khớp color mới VÀ cùng spec đang chọn
      const currentSpec = selectedVariant?.spec || selectedVariant?.storage;
      let v = product.variants.find(x => (x.spec || x.storage) === currentSpec && x.color === col);
      if (!v) {
        v = product.variants.find(x => x.color === col);
      }
      if (v) {
        selectedVariant = v;
        patchProductUI();
      }
    };
  }

  // 4. Quantity buttons
  const decBtn = document.getElementById('btn-qty-dec');
  const incBtn = document.getElementById('btn-qty-inc');
  const qtyInput = document.getElementById('input-qty');

  if (decBtn) {
    decBtn.onclick = () => {
      if (quantity > 1) {
        quantity--;
        if (qtyInput) qtyInput.value = quantity;
      }
    };
  }
  if (incBtn) {
    incBtn.onclick = () => {
      const max = selectedVariant?.stockQty || 99;
      if (quantity < max) {
        quantity++;
        if (qtyInput) qtyInput.value = quantity;
      } else {
        toast.warning(`Kho chỉ còn sẵn ${max} sản phẩm!`);
      }
    };
  }

  // 5. Thêm vào giỏ hàng (cả desktop và mobile sticky)
  const handleAddToCart = () => {
    if (!selectedVariant) return;
    if ((selectedVariant.stockQty || 0) <= 0) {
      toast.warning('Sản phẩm tạm thời hết hàng!');
      return;
    }
    cartStore.addItem(selectedVariant.id, quantity);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
  };

  document.getElementById('btn-add-to-cart')?.addEventListener('click', handleAddToCart);
  document.getElementById('btn-sticky-add-cart')?.addEventListener('click', handleAddToCart);

  // 6. Mua ngay (cả desktop và mobile sticky)
  const handleBuyNow = () => {
    if (!selectedVariant) return;
    if ((selectedVariant.stockQty || 0) <= 0) {
      toast.warning('Sản phẩm tạm thời hết hàng!');
      return;
    }
    cartStore.addItem(selectedVariant.id, quantity);
    window.location.href = '/customer/pages/checkout.html';
  };

  document.getElementById('btn-buy-now')?.addEventListener('click', handleBuyNow);
  document.getElementById('btn-sticky-buy-now')?.addEventListener('click', handleBuyNow);

  // 7. Lightbox xem ảnh lớn
  document.getElementById('main-image-wrapper')?.addEventListener('click', () => {
    openImageLightbox();
  });

  // 8. Trả góp 0%
  document.getElementById('btn-open-installment')?.addEventListener('click', () => {
    openInstallmentModal();
  });
}

function openImageLightbox() {
  const images = product.images?.length > 0 ? product.images : ['https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png'];
  let currentIdx = activeImageIndex;

  const getBodyHtml = (idx) => `
    <div class="space-y-4 text-center">
      <div class="relative w-full h-[60vh] max-h-[500px] flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden p-4">
        <img
          id="lightbox-large-img"
          src="${esc(images[idx])}"
          alt="${esc(product.name)}"
          class="max-w-full max-h-full object-contain transition-all duration-200"
        />
      </div>

      <div class="flex items-center justify-between text-xs font-semibold px-2">
        <button type="button" id="btn-lightbox-prev" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer">
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
          <span>Ảnh trước</span>
        </button>

        <span class="text-slate-500 font-mono">Ảnh ${idx + 1} / ${images.length}</span>

        <button type="button" id="btn-lightbox-next" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer">
          <span>Ảnh tiếp</span>
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;

  const modal = openModal({
    title: `${esc(product.name)} (Hình ảnh độ nét cao)`,
    bodyHtml: getBodyHtml(currentIdx),
    maxWidth: '680px'
  });

  const bindLightboxClicks = () => {
    const prevBtn = modal.element.querySelector('#btn-lightbox-prev');
    const nextBtn = modal.element.querySelector('#btn-lightbox-next');

    if (prevBtn) {
      prevBtn.onclick = () => {
        currentIdx = (currentIdx - 1 + images.length) % images.length;
        modal.element.querySelector('.p-5').innerHTML = getBodyHtml(currentIdx);
        bindLightboxClicks();
        window.lucide?.createIcons();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        currentIdx = (currentIdx + 1) % images.length;
        modal.element.querySelector('.p-5').innerHTML = getBodyHtml(currentIdx);
        bindLightboxClicks();
        window.lucide?.createIcons();
      };
    }
  };

  bindLightboxClicks();
  window.lucide?.createIcons();
}

function openInstallmentModal() {
  const price = selectedVariant?.price || 10000000;
  let term = 6;
  let prepayPercent = 20;

  const calculate = () => {
    const prepayAmount = Math.round((price * prepayPercent) / 100);
    const loanAmount = price - prepayAmount;
    const monthlyPayment = Math.round(loanAmount / term);
    return { prepayAmount, loanAmount, monthlyPayment };
  };

  const getBodyHtml = () => {
    const { prepayAmount, loanAmount, monthlyPayment } = calculate();
    return `
      <div class="space-y-4 text-xs sm:text-sm">
        <div class="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-semibold">Sản phẩm áp dụng:</p>
            <p class="font-bold text-slate-900">${esc(product.name)}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-500 font-semibold">Giá máy:</p>
            <p class="font-bold font-mono text-[#DC2626] text-sm">${formatVND(price)}</p>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-2">1. Chọn kỳ hạn trả góp:</label>
          <div class="grid grid-cols-3 gap-2">
            ${[6, 9, 12].map(m => `
              <button
                type="button"
                class="term-choice-btn py-2 rounded-xl border text-center font-bold text-xs cursor-pointer ${m === term ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}"
                data-term="${m}"
              >
                ${m} tháng
              </button>
            `).join('')}
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-2">2. Chọn tỷ lệ trả trước:</label>
          <div class="grid grid-cols-4 gap-2">
            ${[0, 20, 30, 50].map(p => `
              <button
                type="button"
                class="prepay-choice-btn py-2 rounded-xl border text-center font-bold text-xs cursor-pointer ${p === prepayPercent ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}"
                data-prepay="${p}"
              >
                ${p}%
              </button>
            `).join('')}
          </div>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-medium">
          <div class="flex justify-between">
            <span class="text-slate-500">Số tiền trả trước:</span>
            <span class="font-bold font-mono text-slate-900">${formatVND(prepayAmount)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Số tiền vay còn lại:</span>
            <span class="font-bold font-mono text-slate-900">${formatVND(loanAmount)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Lãi suất:</span>
            <span class="font-bold text-emerald-600">0% (Không phát sinh)</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-slate-200 text-sm">
            <span class="font-bold text-slate-800">Góp mỗi tháng (${term} tháng):</span>
            <span class="font-black font-mono text-[#DC2626]">${formatVND(monthlyPayment)}/tháng</span>
          </div>
        </div>

        <div class="space-y-1.5 pt-1">
          <label class="block font-bold text-slate-800 text-xs">Họ tên & Số điện thoại nhận tư vấn duyệt:</label>
          <input type="text" id="installment-phone" placeholder="Nhập số điện thoại để nhân viên showroom gọi lại..." class="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#DC2626] outline-hidden" />
        </div>
      </div>
    `;
  };

  const modal = openModal({
    title: 'Tính Toán Trả Góp 0% Lãi Suất (BR-10)',
    bodyHtml: getBodyHtml(),
    footerHtml: `
      <button type="button" id="btn-submit-installment" class="w-full py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
        Gửi Yêu Cầu Duyệt Hồ Sơ Trả Góp
      </button>
    `,
    maxWidth: '500px'
  });

  const bindModalClicks = () => {
    modal.element.querySelectorAll('.term-choice-btn').forEach(btn => {
      btn.onclick = () => {
        term = Number(btn.dataset.term) || 6;
        modal.element.querySelector('.p-5').innerHTML = getBodyHtml();
        bindModalClicks();
      };
    });

    modal.element.querySelectorAll('.prepay-choice-btn').forEach(btn => {
      btn.onclick = () => {
        prepayPercent = Number(btn.dataset.prepay) || 0;
        modal.element.querySelector('.p-5').innerHTML = getBodyHtml();
        bindModalClicks();
      };
    });

    const submitBtn = modal.element.querySelector('#btn-submit-installment');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const phone = modal.element.querySelector('#installment-phone')?.value?.trim();
        if (!phone) {
          toast.warning('Vui lòng nhập số điện thoại để showroom liên hệ hỗ trợ!');
          return;
        }
        modal.close();
        toast.success(`Yêu cầu trả góp gói ${term} tháng cho số điện thoại ${phone} đã được gửi thành công! Chuyên viên showroom sẽ liên hệ trong 5 phút.`);
      };
    }
  };

  bindModalClicks();
}

initProductDetailPage();
