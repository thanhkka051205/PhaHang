/**
 * Script Tra Cứu Bảo Hành Điện Tử Chính Hãng (warranty.html)
 * Chuẩn Wireframe Hình 14 SRS, NFR-02.3, FR-12, UC-12
 * Tái tạo 100% diện mạo và class Tailwind từ commit 1a9e3c2
 */
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { mockService } from '../services/mockService.js';
import { formatDate } from '../core/format.js';
import { esc, getQueryParam } from '../core/dom.js';
import { renderBackendGapBanner } from '../core/backendGaps.js';

export function initWarrantyPage() {
  mountHeader();
  mountFooter();

  const container = document.getElementById('warranty-lookup-container');
  if (!container) return;

  const urlSerial = getQueryParam('serial') || '';

  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-8">
      <!-- Tiêu đề trang -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#DC2626] border border-red-200 text-xs font-bold uppercase tracking-wider">
          <i data-lucide="shield-check" class="w-4 h-4"></i>
          <span>Hệ Thống Bảo Hành Điện Tử Pha Hằng</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tra Cứu Thông Tin Bảo Hành Thiết Bị
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Nhập số seri sản phẩm (dán trên thân máy hoặc trên phiếu giao hàng) hoặc số điện thoại người mua để kiểm tra thời hạn và lịch sử bảo hành.
        </p>
      </div>

      <!-- Khung tìm kiếm (Wireframe Hình 14) -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
        <form id="warranty-search-form" class="space-y-4">
          <div class="space-y-1.5">
            <label class="block font-bold text-slate-800 text-xs sm:text-sm">
              Nhập Số Seri Máy hoặc Số Điện Thoại Mua Hàng:
            </label>
            <div class="flex flex-col sm:flex-row gap-2.5">
              <div class="relative flex-1">
                <input
                  type="text"
                  id="warranty-input"
                  value="${esc(urlSerial)}"
                  placeholder="Ví dụ: SN-SNY-2026-001 hoặc 0988123456"
                  class="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:border-[#DC2626] outline-hidden shadow-2xs font-mono"
                  required
                />
                <i data-lucide="search" class="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none"></i>
              </div>
              <button
                type="submit"
                class="h-12 px-6 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm shadow-btn-brand transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <i data-lucide="search" class="w-4 h-4"></i>
                <span>Tra Cứu Ngay</span>
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
            <span class="font-semibold text-slate-600">Gợi ý mẫu tra cứu:</span>
            <button type="button" class="quick-serial-btn font-mono text-[#DC2626] hover:underline" data-val="SN-SAM-55DU-849102">SN-SAM-55DU-849102</button>
            <span>•</span>
            <button type="button" class="quick-serial-btn font-mono text-[#DC2626] hover:underline" data-val="SN-DK-9K-481923">SN-DK-9K-481923</button>
            <span>•</span>
            <button type="button" class="quick-serial-btn font-mono text-[#DC2626] hover:underline" data-val="0912345678">0912345678</button>
          </div>
        </form>
      </div>

      <!-- Khu vực hiển thị kết quả -->
      <div id="warranty-result-area"></div>
    </div>
  `;

  bindWarrantyEvents();
  window.lucide?.createIcons();

  if (urlSerial) {
    executeLookup(urlSerial);
  }
}

function bindWarrantyEvents() {
  const form = document.getElementById('warranty-search-form');
  const input = document.getElementById('warranty-input');

  if (form && input) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) executeLookup(val);
    };
  }

  document.querySelectorAll('.quick-serial-btn').forEach(btn => {
    btn.onclick = () => {
      const val = btn.dataset.val;
      if (input) input.value = val;
      executeLookup(val);
    };
  });
}

async function executeLookup(query) {
  const resultArea = document.getElementById('warranty-result-area');
  if (!resultArea) return;

  resultArea.innerHTML = `
    <div class="flex items-center justify-center py-12 text-slate-400 gap-2">
      <i data-lucide="loader-2" class="w-5 h-5 animate-spin text-[#DC2626]"></i>
      <span class="text-xs font-semibold">Đang truy xuất hồ sơ bảo hành từ hệ thống Pha Hằng...</span>
    </div>
  `;
  window.lucide?.createIcons();

  const res = await mockService.lookupWarranty(query);
  const w = Array.isArray(res) ? res[0] : (res?.found ? res.data : null);

  if (w) {
    resultArea.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-in fade-in duration-200">
        <!-- Banner kết quả hợp lệ -->
        <div class="bg-emerald-500 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <i data-lucide="shield-check" class="w-6 h-6 text-white"></i>
            </div>
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider opacity-90 block">HỒ SƠ BẢO HÀNH CHÍNH HÃNG</span>
              <h3 class="text-base sm:text-lg font-black tracking-tight">${esc(w.productName)}</h3>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-black bg-white text-emerald-800 shadow-xs">
            ${esc(w.statusText || 'ĐANG TRONG THỜI HẠN BẢO HÀNH')}
          </span>
        </div>

        <!-- Chi tiết hồ sơ bảo hành điện tử -->
        <div class="p-5 sm:p-7 space-y-6 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span class="text-slate-500 block mb-0.5">Số Seri Máy (Serial No):</span>
              <span class="font-mono font-black text-slate-900 text-sm sm:text-base">${esc(w.serialNo || w.serialNumber)}</span>
            </div>
            <div>
              <span class="text-slate-500 block mb-0.5">Mã đơn hàng gốc:</span>
              <span class="font-mono font-bold text-[#DC2626] text-sm">${w.orderCode ? esc(w.orderCode) : '#DH' + (w.orderId || '')}</span>
            </div>
            <div>
              <span class="text-slate-500 block mb-0.5">Khách hàng đăng ký:</span>
              <span class="font-bold text-slate-900">${esc(w.customerName)}</span>
            </div>
            <div>
              <span class="text-slate-500 block mb-0.5">Số điện thoại kích hoạt:</span>
              <span class="font-mono font-bold text-slate-900">${esc(w.customerPhone)}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div class="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <span class="text-[11px] text-slate-500 block mb-1">Ngày mua & Lắp đặt</span>
              <strong class="text-slate-900 text-xs sm:text-sm font-mono block">${formatDate(w.activatedDate)}</strong>
            </div>
            <div class="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <span class="text-[11px] text-slate-500 block mb-1">Thời hạn bảo hành</span>
              <strong class="text-[#DC2626] text-xs sm:text-sm block">${w.warrantyMonths || 24} Tháng</strong>
            </div>
            <div class="p-3 bg-red-50/50 rounded-xl border border-red-100">
              <span class="text-[11px] text-slate-500 block mb-1">Hết hạn bảo hành</span>
              <strong class="text-slate-900 text-xs sm:text-sm font-mono block">${formatDate(w.expireDate)}</strong>
            </div>
          </div>

          <!-- Lịch sử sửa chữa / bảo dưỡng -->
          <div class="space-y-3 pt-3 border-t border-slate-100">
            <h4 class="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="wrench" class="w-4 h-4 text-[#DC2626]"></i>
              <span>Nhật Ký Bảo Trì & Sửa Chữa Tại Showroom</span>
            </h4>
            ${w.history && w.history.length > 0 ? `
              <div class="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                ${w.history.map(h => `
                  <div class="p-3 bg-white flex justify-between items-center text-xs">
                    <div>
                      <p class="font-bold text-slate-800">${esc(h.action)}</p>
                      <p class="text-slate-500 text-[11px]">Kỹ thuật viên: ${esc(h.technician || 'Showroom Pha Hằng')}</p>
                    </div>
                    <span class="text-slate-400 font-mono text-[11px]">${formatDate(h.date)}</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="p-4 rounded-xl bg-slate-50 text-slate-500 text-center border border-slate-200">
                <p>Thiết bị chưa có lịch sử sửa chữa hoặc phát sinh lỗi bảo hành. Tình trạng hoạt động hoàn hảo.</p>
              </div>
            `}
          </div>

          <!-- Hotline hỗ trợ bảo hành tận nơi -->
          <div class="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="space-y-0.5 text-center sm:text-left">
              <p class="font-bold text-xs">Cần kỹ thuật viên hỗ trợ kiểm tra tận nhà?</p>
              <p class="text-[11px] text-slate-400">Miễn phí kiểm tra đối với các thiết bị Tivi, Tủ lạnh, Điều hòa trong thời hạn bảo hành</p>
            </div>
            <a href="tel:0988123456" class="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold font-mono text-xs shadow-xs transition-colors shrink-0">
              📞 0988 123 456
            </a>
          </div>
        </div>
      </div>
    `;
  } else {
    resultArea.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs animate-in fade-in duration-200">
        <div class="w-14 h-14 rounded-2xl bg-rose-50 text-[#DC2626] flex items-center justify-center mx-auto border border-rose-100">
          <i data-lucide="shield-alert" class="w-7 h-7"></i>
        </div>
        <h3 class="text-base font-bold text-slate-900">Không tìm thấy thông tin bảo hành</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Không tìm thấy hồ sơ bảo hành khớp với số seri hoặc số điện thoại <strong class="text-slate-800 font-mono">"${esc(query)}"</strong>.
          Vui lòng kiểm tra lại tem dán trên thân máy hoặc liên hệ hotline <strong class="text-[#DC2626] font-mono">0988 123 456</strong> để được hỗ trợ tra cứu trực tiếp.
        </p>
      </div>
    `;
  }

  window.lucide?.createIcons();
}

initWarrantyPage();
