/**
 * ProductCard Component
 * Tái tạo 100% diện mạo và class Tailwind chuẩn BA
 */
import { esc } from '../core/dom.js';
import { formatVND } from '../core/format.js';
import { renderGapBadge, renderMissingImageBox } from '../core/backendGaps.js';

export function renderProductCard(product) {
  const defaultVariant = product.variants?.[0];
  const lowestPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map(v => v.price))
    : (product.price || 0);

  const lowestListPrice = defaultVariant?.listPrice || product.originalPrice || null;
  const discountPercent = (lowestListPrice && lowestListPrice > lowestPrice)
    ? Math.round(((lowestListPrice - lowestPrice) / lowestListPrice) * 100)
    : (product.discountPercent || null);

  const totalStock = product.variants
    ? product.variants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
    : 15;

  const specChips = [];
  // 1. Biến thể quy cách / cấu hình
  if (defaultVariant?.spec) {
    specChips.push(defaultVariant.spec);
  } else if (defaultVariant?.storage) {
    specChips.push(defaultVariant.storage);
  }

  // 2. Kích thước inch nếu chưa có trong chip
  const inchMatch = product.name.match(/\b(\d{2,3})[\s]*(?:inch|in|"|”)\b/i);
  if (inchMatch && !specChips.some(c => c.includes(inchMatch[1]))) {
    specChips.push(`${inchMatch[1]}"`);
  }

  // 3. Dung tích lít từ tên nếu chưa có
  const literMatch = product.name.match(/\b(\d+(?:\.\d+)?)\s*(?:lít|L)\b/i);
  if (literMatch && !specChips.some(c => c.toLowerCase().includes('lít') || c.toLowerCase().includes('l'))) {
    specChips.push(`${literMatch[1]} Lít`);
  }

  // 4. Inverter tiết kiệm điện
  if (/inverter/i.test(product.name) && !specChips.some(c => /inverter/i.test(c))) {
    specChips.push('Inverter');
  }

  // 5. 4K Ultra HD
  if (/\b4k\b/i.test(product.name) && !specChips.some(c => /4k/i.test(c))) {
    specChips.push('4K UHD');
  }

  const visibleChips = specChips.slice(0, 3);
  const fallbackImg = 'https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png';
  const imageUrl = product.images?.[0] || fallbackImg;

  return `
    <article class="flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-[#DC2626]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
      <!-- 1. Ảnh sản phẩm & Badge khuyến mãi -->
      <a href="product-detail.html?id=${product.id}" class="block relative w-full aspect-square bg-[#F8FAFC] p-4 border-b border-slate-100 overflow-hidden">
        <!-- Badge thương hiệu & giảm giá góc trên bên trái -->
        <div class="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white shadow-xs">
            ${esc(product.brand)}
          </span>
          ${discountPercent ? `
            <span class="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#DC2626] text-white shadow-xs">
              -${discountPercent}%
            </span>
          ` : ''}
        </div>

        <!-- Badge trả góp 0% hoặc Quản lý Seri & Thời hạn bảo hành góc trên bên phải -->
        <div class="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
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
        </div>

        <img
          src="${esc(imageUrl)}"
          alt="${esc(product.name)}"
          class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackImg}';"
        />

        ${totalStock === 0 ? `
          <div class="absolute inset-0 bg-white/80 backdrop-blur-2xs flex items-center justify-center z-10">
            <span class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-800 rounded-lg shadow-sm">
              Hết hàng
            </span>
          </div>
        ` : ''}
      </a>

      <!-- 2. Thông tin: Tên sản phẩm, Spec Chips, Giá tiền, Ưu đãi, Nút xem chi tiết -->
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <a href="product-detail.html?id=${product.id}" class="block group-hover:text-[#DC2626] transition-colors">
            <h3 class="text-sm font-bold text-slate-800 line-clamp-2 leading-snug min-h-[40px]">
              ${esc(product.name)}
            </h3>
          </a>

          <!-- Spec Chips tóm tắt (inch, dung tích, inverter, 4K...) -->
          ${visibleChips.length > 0 ? `
            <div class="flex flex-wrap gap-1 mt-2">
              ${visibleChips.map(c => `
                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  ${esc(c)}
                </span>
              `).join('')}
            </div>
          ` : ''}

          <!-- Giá tiền (Chuẩn SRS UI-04) -->
          <div class="mt-2.5 flex flex-col gap-1 items-start">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span class="text-base sm:text-lg font-black font-mono text-[#DC2626] whitespace-nowrap">
                ${formatVND(lowestPrice || 8990000)}
              </span>
              ${lowestListPrice && lowestListPrice > lowestPrice ? `
                <span class="text-xs text-slate-400 line-through font-mono whitespace-nowrap">
                  ${formatVND(lowestListPrice)}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Hộp ưu đãi thành viên (Smember pattern) -->
          <div class="mt-2 bg-red-50/70 border border-red-100 rounded-lg p-1.5 flex items-center gap-1.5 text-[11px] text-[#DC2626]">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 shrink-0 text-[#DC2626]"></i>
            <span class="font-semibold truncate">Thành viên Pha Hằng giảm thêm 300K</span>
          </div>
        </div>

        <!-- Nút xem chi tiết (Wireframe Hình 11) -->
        <div class="pt-2">
          <a
            href="product-detail.html?id=${product.id}"
            class="w-full h-9 rounded-xl border border-slate-200 hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626] text-slate-700 font-bold text-xs flex items-center justify-center transition-colors select-none ${totalStock === 0 ? 'pointer-events-none opacity-50 bg-slate-100' : ''}"
          >
            ${totalStock === 0 ? 'Hết hàng' : 'Xem chi tiết'}
          </a>
        </div>
      </div>
    </article>
  `;
}
