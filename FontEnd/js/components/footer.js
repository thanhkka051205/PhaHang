/**
 * Footer Thông Tin Cửa Hàng Điện Máy Pha Hằng
 * Tái tạo 100% diện mạo và class Tailwind từ commit 1a9e3c2
 */
import { openModal } from './modal.js';

export function mountFooter(root = document.getElementById('app-footer')) {
  if (!root) return;

  root.innerHTML = `
    <footer class="bg-white border-t border-slate-200 mt-16 text-slate-600 w-full text-xs">
      <!-- Cam kết 4 tiêu chí vàng -->
      <div class="border-b border-slate-200 bg-red-50/20 py-6 w-full">
        <div class="edge-container">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div class="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0 border border-red-100">
                <i data-lucide="award" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900">100% Chính Hãng</h4>
                <p class="text-[11px] text-slate-500 mt-0.5">Xuất xứ nguồn gốc rõ ràng</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <i data-lucide="truck" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900">Lắp Đặt Tận Nơi</h4>
                <p class="text-[11px] text-slate-500 mt-0.5">Miễn phí giao hàng tại Gia Lâm</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div class="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0 border border-red-100">
                <i data-lucide="shield-check" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900">Bảo Hành Số Seri 24/7</h4>
                <p class="text-[11px] text-slate-500 mt-0.5">Tra cứu trực tuyến tức thì</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <i data-lucide="credit-card" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900">Trả Góp 0% Lãi Suất</h4>
                <p class="text-[11px] text-slate-500 mt-0.5">Hỗ trợ qua CCCD & Thẻ tín dụng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Thông tin cửa hàng -->
      <div class="edge-container py-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="sm:col-span-2 space-y-3.5">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-[#DC2626] text-white flex items-center justify-center font-black shadow-xs">
                <i data-lucide="tv" class="w-5 h-5"></i>
              </div>
              <div>
                <span class="text-base font-black tracking-tight text-slate-900 block leading-tight">
                  ĐIỆN MÁY <span class="text-[#DC2626]">PHA HẰNG</span>
                </span>
                <span class="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Cửa Hàng Điện Tử - Điện Lạnh - Đồ Gia Dụng Pha Hằng</span>
              </div>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed max-w-md">
              Chuyên bán lẻ các thiết bị điện tử, điện lạnh và đồ gia dụng chính hãng: Ti vi Smart 4K, Điều hòa Inverter 1 & 2 chiều, Tủ lạnh ngăn đông mềm/Side by side, Quạt điện các loại và Nồi cơm điện cao cấp. Cam kết giá tốt, bảo hành chu đáo.
            </p>

            <div class="space-y-1.5 text-xs text-slate-700">
              <div class="flex items-start gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5"></i>
                <span>Địa chỉ showroom: <strong>Xóm 8, đường Đình Xuyên, Gia Lâm, Hà Nội</strong></span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="phone" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span>Tư vấn & Đặt hàng: <strong class="text-[#DC2626] font-mono text-sm">0988 123 456</strong> (8:00 - 21:30 hàng ngày)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200">
              5 Ngành Hàng Chính
            </h4>
            <ul class="space-y-2 text-xs text-slate-600">
              <li><a href="/index.html?category=1" class="hover:text-[#DC2626] transition-colors">Ti vi Smart 4K & OLED</a></li>
              <li><a href="/index.html?category=2" class="hover:text-[#DC2626] transition-colors">Điều hòa Inverter Tiết Kiệm Điện</a></li>
              <li><a href="/index.html?category=3" class="hover:text-[#DC2626] transition-colors">Tủ lạnh Ngăn đá dưới & Side by Side</a></li>
              <li><a href="/index.html?category=4" class="hover:text-[#DC2626] transition-colors">Quạt đứng, Quạt treo & Quạt điều hòa</a></li>
              <li><a href="/index.html?category=5" class="hover:text-[#DC2626] transition-colors">Nồi cơm điện tử & Cao tần Cuckoo</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-200">
              Chính Sách & Dịch Vụ
            </h4>
            <ul class="space-y-2 text-xs text-slate-600">
              <li><a href="/warranty.html" class="hover:text-[#DC2626] transition-colors font-semibold text-[#DC2626]">Tra Cứu Bảo Hành Điện Tử</a></li>
              <li><a href="/my-orders.html" class="hover:text-[#DC2626] transition-colors">Kiểm Tra Trạng Thái Đơn Hàng</a></li>
              <li>
                <button type="button" id="policy-btn-return" class="hover:text-[#DC2626] text-slate-600 transition-colors text-left cursor-pointer">
                  Chính sách 1 Đổi 1 trong 30 ngày
                </button>
              </li>
              <li>
                <button type="button" id="policy-btn-delivery" class="hover:text-[#DC2626] text-slate-600 transition-colors text-left cursor-pointer">
                  Giao hàng và lắp đặt siêu tốc 2h
                </button>
              </li>
              <li>
                <button type="button" id="policy-btn-privacy" class="hover:text-[#DC2626] text-slate-600 transition-colors text-left cursor-pointer">
                  Bảo vệ dữ liệu (Nghị định 13/2023/NĐ-CP)
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Cửa Hàng Điện Máy Pha Hằng. Bản quyền thuộc về Pha Hằng - Đình Xuyên, Gia Lâm, Hà Nội.</p>
          <p class="font-mono text-slate-400">Website Bán Lẻ Điện Máy Chuẩn Hiện Đại</p>
        </div>
      </div>
    </footer>
  `;

  // Gắn sự kiện modal chính sách
  const bindPolicy = (id, title, content) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = () => {
        openModal({
          title,
          bodyHtml: `<div class="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">${content}</div>`
        });
      };
    }
  };

  bindPolicy('policy-btn-return', 'Chính sách 1 Đổi 1 Trong 30 Ngày', `
    <p>Điện Máy Pha Hằng áp dụng chính sách đổi mới sản phẩm miễn phí trong vòng 30 ngày kể từ ngày mua hàng nếu thiết bị gặp lỗi kỹ thuật từ nhà sản xuất.</p>
    <p><strong>Điều kiện đổi mới:</strong></p>
    <ul class="list-disc pl-5 space-y-1">
      <li>Sản phẩm còn nguyên tem niêm phong, số seri trùng khớp với hóa đơn mua hàng.</li>
      <li>Đầy đủ phụ kiện, thùng xốp, sách hướng dẫn kèm theo ban đầu.</li>
      <li>Kỹ thuật viên của Showroom sẽ kiểm tra và xác nhận lỗi tận nhà trong vòng 24h.</li>
    </ul>
  `);

  bindPolicy('policy-btn-delivery', 'Chính Sách Giao Hàng & Lắp Đặt Siêu Tốc 2H', `
    <p>Áp dụng cho mọi khách hàng đặt mua các sản phẩm Tivi, Tủ lạnh, Điều hòa, Máy giặt, Quạt tại khu vực Gia Lâm, Long Biên và các quận lân cận tại Hà Nội.</p>
    <p><strong>Cam kết giao hàng:</strong></p>
    <ul class="list-disc pl-5 space-y-1">
      <li>Giao hàng và lắp đặt hoàn chỉnh trong vòng 2 giờ kể từ khi nhân viên liên hệ xác nhận đơn.</li>
      <li>Miễn phí 100% công lắp đặt máy lạnh, tivi treo tường.</li>
      <li>Khách hàng được kiểm tra, cắm điện chạy thử ưng ý mới thanh toán.</li>
    </ul>
  `);

  bindPolicy('policy-btn-privacy', 'Bảo Vệ Dữ Liệu Cá Nhân (Nghị Định 13/2023/NĐ-CP)', `
    <p>Cửa hàng Điện Máy Pha Hằng cam kết tuân thủ nghiêm ngặt các quy định về bảo vệ dữ liệu cá nhân theo Nghị định số 13/2023/NĐ-CP của Chính phủ.</p>
    <ul class="list-disc pl-5 space-y-1">
      <li>Thông tin họ tên, số điện thoại, địa chỉ chỉ được sử dụng cho mục đích giao hàng, kích hoạt bảo hành điện tử và chăm sóc khách hàng.</li>
      <li>Chúng tôi tuyệt đối không chia sẻ hoặc bán dữ liệu cho bất kỳ bên thứ ba nào.</li>
      <li>Khách hàng có toàn quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân bất cứ lúc nào.</li>
    </ul>
  `);

  window.lucide?.createIcons();
}
