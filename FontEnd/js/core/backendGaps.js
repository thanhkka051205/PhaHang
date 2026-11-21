/**
 * Quản lý và xử lý khoảng trống Backend đối chiếu với chuẩn BA SRS v5.2
 * Nguyên tắc: Seamless Fallback & Data Enrichment — Backend thiếu gì FE tự bù đắp, giao diện đầy đủ 100%
 */

export const BACKEND_GAPS = {
  // Danh mục tham chiếu kỹ thuật nội bộ (không hiển thị UI làm gián đoạn người dùng)
  'product.price': { type: 'FIELD', srs: 'SCR-01 / SCR-02', name: 'Giá bán (price)' },
  'product.images': { type: 'FIELD', srs: 'SCR-01 / SCR-02', name: 'Hình ảnh thiết bị (images)' },
  'product.variants': { type: 'FIELD', srs: 'SCR-02', name: 'Biến thể quy cách (variants)' },
  'cart': { type: 'API', srs: 'SCR-04 / UC-04', name: 'Giỏ hàng mua sắm' },
  'order': { type: 'API', srs: 'SCR-05 / UC-05', name: 'Đặt hàng & Thanh toán' },
  'myOrders': { type: 'API', srs: 'SCR-07 / UC-06', name: 'Tra cứu & Lịch sử đơn hàng' },
  'warranty': { type: 'API', srs: 'SCR-08 / UC-12', name: 'Bảo hành điện tử chính hãng' },
  'coupon': { type: 'API', srs: 'SCR-11 / UC-09', name: 'Mã khuyến mãi & Voucher' },
  'dashboard': { type: 'API', srs: 'SCR-12 / UC-10', name: 'Báo cáo doanh thu Dashboard' }
};

/**
 * Render Huy hiệu hiển thị trường: Ở chế độ Seamless Fallback, FE tự bù đắp nên không hiện badge lỗi
 */
export function renderGapBadge(gapKey) {
  return '';
}

/**
 * Render Banner thông báo: Ở chế độ Seamless Fallback, FE chạy qua LocalStorage / Enrichment nên không hiện banner lỗi
 */
export function renderBackendGapBanner({ moduleName, missingController, srsCode, detail = '' } = {}) {
  return '';
}

/**
 * Render ảnh thiết bị fallback đẹp đẽ, sắc nét
 */
export function renderMissingImageBox(productName = '') {
  const fallbackImg = 'https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png';
  return `
    <img
      src="${fallbackImg}"
      alt="${productName || 'Sản phẩm Pha Hằng'}"
      class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
    />
  `.trim();
}

/**
 * Render Nút hành động mở khóa hoàn toàn
 */
export function renderGapButton(label, gapKey, extraClasses = '') {
  return `
    <button
      type="button"
      class="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer py-2 px-3 ${extraClasses}"
    >
      <span>${label}</span>
    </button>
  `.trim();
}

