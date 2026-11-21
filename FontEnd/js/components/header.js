/**
 * Header 2 tầng tiện ích chuẩn CellphoneS (UI-01, REQ-002)
 * Tái tạo 100% diện mạo và class Tailwind từ commit 1a9e3c2
 */
import { esc, $ } from '../core/dom.js';
import { formatVND } from '../core/format.js';
import { cartStore } from '../stores/cartStore.js';
import { authStore } from '../stores/authStore.js';
import { searchSuggestions } from '../services/productSearch.js';

export function mountHeader(root = (typeof document !== 'undefined' ? document.getElementById('app-header') : null)) {
  if (!root) return;

  const render = () => {
    const user = authStore.getClientUser();
    const admin = authStore.getAdminUser();
    const cartCount = cartStore.count();
    const isStaffOrAdmin = admin && (admin.role === 'ADMIN' || admin.role === 'STAFF');

    root.innerHTML = `
      <header class="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-slate-200 select-none">
        <!-- Tầng 1: Dải tiện ích tinh gọn Topbar (Deep Slate Navy) -->
        <div class="bg-[#0F172A] text-slate-300 text-[11px] py-1 border-b border-slate-800">
          <!-- Hiển thị trên Desktop (md trở lên) -->
          <div class="edge-container hidden md:flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-1.5 hover:text-white transition-colors">
                <i data-lucide="phone-call" class="w-3.5 h-3.5 text-red-400"></i>
                <span>Hotline tư vấn: <strong class="text-white font-mono">0988 123 456</strong></span>
              </div>
              <div class="flex items-center gap-1.5 hover:text-white transition-colors">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>Showroom: Xóm 8, Đường Đình Xuyên, Gia Lâm, Hà Nội</span>
              </div>
            </div>

            <div class="flex items-center gap-4 font-medium">
              <span class="flex items-center gap-1 text-emerald-400">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                <span>Cam kết 100% Chính hãng</span>
              </span>
              <a href="/warranty.html" class="hover:text-white transition-colors flex items-center gap-1">
                <i data-lucide="shield-check" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>Tra cứu bảo hành</span>
              </a>
              ${!isStaffOrAdmin ? `
                <a href="/my-orders.html" class="hover:text-white transition-colors flex items-center gap-1">
                  <i data-lucide="package-check" class="w-3.5 h-3.5 text-slate-400"></i>
                  <span>Kiểm tra đơn hàng</span>
                </a>
              ` : `
                <a href="/admin/index.html" class="text-emerald-400 font-bold hover:text-white transition-colors flex items-center gap-1">
                  <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 text-emerald-400"></i>
                  <span>Cổng quản trị</span>
                </a>
              `}
              <a href="/admin/login.html" class="hover:text-white text-slate-400 transition-colors">
                Nhân viên
              </a>
            </div>
          </div>

          <!-- Hiển thị trên Mobile (dưới md) -->
          <div class="edge-container flex md:hidden items-center justify-between text-[11px] px-2.5">
            <a href="tel:0988123456" class="flex items-center gap-1 text-red-400 font-bold hover:text-white transition-colors">
              <i data-lucide="phone-call" class="w-3 h-3"></i>
              <span class="font-mono">0988 123 456</span>
            </a>
            <div class="flex items-center gap-3">
              <a href="/warranty.html" class="flex items-center gap-1 text-slate-300 hover:text-white transition-colors">
                <i data-lucide="shield-check" class="w-3 h-3 text-slate-400"></i>
                <span>Bảo hành</span>
              </a>
              <a href="/my-orders.html" class="flex items-center gap-1 text-slate-300 hover:text-white transition-colors">
                <i data-lucide="package-check" class="w-3 h-3 text-slate-400"></i>
                <span>Đơn hàng</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Tầng 2: Thanh điều hướng chính (Logo, Mega Category Button, Smart Search, Actions) -->
        <div class="border-b border-slate-100 bg-white py-2 md:py-0">
          <div class="edge-container flex flex-wrap md:flex-nowrap items-center justify-between gap-2 sm:gap-4 md:h-16">
            
            <!-- 1. Tên cửa hàng & Logo (UI-01) -->
            <a href="/index.html" class="flex items-center gap-2 sm:gap-2.5 shrink-0 group py-1 order-1">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform">
                <i data-lucide="tv" class="w-4 h-4 sm:w-5 sm:h-5"></i>
              </div>
              <div class="flex flex-col">
                <span class="text-sm sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                  ĐIỆN MÁY <span class="text-[#DC2626]">PHA HẰNG</span>
                </span>
                <span class="text-[10px] text-slate-500 font-semibold tracking-wide hidden sm:inline">
                  Chuyên thiết bị điện tử • điện lạnh • gia dụng
                </span>
              </div>
            </a>

            <!-- Nút Danh mục (Mega Category Button) -->
            <div class="relative shrink-0 order-2" id="category-wrapper">
              <button
                type="button"
                id="btn-category-toggle"
                class="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#DC2626] font-bold text-xs transition-colors border border-transparent hover:border-red-200 min-h-[40px]"
              >
                <i data-lucide="grid" class="w-4 h-4 text-[#DC2626]"></i>
                <span class="hidden sm:inline">Danh mục</span>
                <i data-lucide="chevron-down" id="category-caret" class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"></i>
              </button>

              <!-- Dropdown danh mục 5 ngành hàng -->
              <nav
                id="category-dropdown"
                class="hidden absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div class="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  5 Ngành hàng điện máy
                </div>
                <a
                  href="/index.html?category=1"
                  class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-red-50 text-slate-700 hover:text-[#DC2626] text-xs font-semibold transition-colors"
                >
                  <div class="w-7 h-7 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
                    <i data-lucide="tv" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Ti vi</span>
                    <span class="text-[10px] text-slate-400 font-normal">Smart TV 4K, OLED, QLED</span>
                  </div>
                </a>
                <a
                  href="/index.html?category=2"
                  class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-red-50 text-slate-700 hover:text-[#DC2626] text-xs font-semibold transition-colors"
                >
                  <div class="w-7 h-7 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
                    <i data-lucide="wind" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Điều hòa</span>
                    <span class="text-[10px] text-slate-400 font-normal">Inverter 1 & 2 chiều, Dual</span>
                  </div>
                </a>
                <a
                  href="/index.html?category=3"
                  class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-red-50 text-slate-700 hover:text-[#DC2626] text-xs font-semibold transition-colors"
                >
                  <div class="w-7 h-7 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
                    <i data-lucide="snowflake" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Tủ lạnh</span>
                    <span class="text-[10px] text-slate-400 font-normal">Ngăn đá dưới, Side by Side</span>
                  </div>
                </a>
                <a
                  href="/index.html?category=4"
                  class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-red-50 text-slate-700 hover:text-[#DC2626] text-xs font-semibold transition-colors"
                >
                  <div class="w-7 h-7 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
                    <i data-lucide="fan" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Quạt làm mát</span>
                    <span class="text-[10px] text-slate-400 font-normal">Quạt đứng, Quạt điều hòa</span>
                  </div>
                </a>
                <a
                  href="/index.html?category=5"
                  class="flex items-center gap-3 px-3.5 py-2.5 hover:bg-red-50 text-slate-700 hover:text-[#DC2626] text-xs font-semibold transition-colors"
                >
                  <div class="w-7 h-7 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
                    <i data-lucide="utensils-crossed" class="w-4 h-4"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold">Nồi cơm điện</span>
                    <span class="text-[10px] text-slate-400 font-normal">Cao tần IH, Nồi điện tử</span>
                  </div>
                </a>
              </nav>
            </div>

            <!-- Ô tìm kiếm thông minh có gợi ý (REQ-002) -->
            <div class="relative flex-1 min-w-[240px] max-w-2xl order-3 w-full md:w-auto" id="search-container">
              <form id="search-form" action="/index.html" method="GET" class="relative flex items-center">
                <input
                  type="text"
                  id="search-input"
                  name="q"
                  class="w-full h-10 pl-10 pr-10 text-xs sm:text-sm bg-slate-100/90 focus:bg-white border border-slate-200 focus:border-[#DC2626] focus:ring-2 focus:ring-red-100 rounded-xl transition-all outline-hidden text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="Bạn cần tìm tivi, tủ lạnh, điều hòa gì hôm nay?..."
                  autocomplete="off"
                  role="combobox"
                  aria-expanded="false"
                  aria-haspopup="listbox"
                  aria-controls="search-suggestions"
                />
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"></i>
                <button
                  type="button"
                  id="search-clear-btn"
                  class="hidden absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </form>

              <!-- Container popup gợi ý tìm kiếm -->
              <div id="search-suggestions-container" class="hidden"></div>
            </div>

            <!-- 4. Nhóm tiện ích bên phải (Tra cứu bảo hành, Giỏ hàng, Tài khoản) -->
            <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0 order-2 md:order-4 ml-auto md:ml-0">
              
              <!-- Nút Tra cứu bảo hành (Wireframe Hình 14) -->
              <a
                href="/warranty.html"
                class="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200 shrink-0 whitespace-nowrap min-h-[40px]"
              >
                <i data-lucide="shield-check" class="w-4 h-4 text-[#DC2626]"></i>
                <span>Tra cứu bảo hành</span>
              </a>

              <!-- Giỏ hàng (n) (Hình 11) -->
              <a
                href="/cart.html"
                id="cart-btn"
                class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 hover:border-[#DC2626] text-slate-800 hover:text-[#DC2626] font-bold text-xs sm:text-sm transition-all bg-white shrink-0 whitespace-nowrap min-h-[40px]"
              >
                <div class="relative">
                  <i data-lucide="shopping-bag" class="w-4 h-4 text-[#DC2626]"></i>
                  <span
                    id="cart-badge"
                    class="${cartCount > 0 ? '' : 'hidden '}absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center font-mono shadow-xs"
                  >
                    ${cartCount}
                  </span>
                </div>
                <span class="hidden sm:inline">Giỏ hàng (<span id="cart-count-text">${cartCount}</span>)</span>
              </a>

              <!-- Đăng nhập hoặc Tên người dùng -->
              <div class="relative shrink-0" id="user-menu-wrapper">
                ${user ? `
                  <button
                    type="button"
                    id="user-menu-toggle"
                    class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all shrink-0 whitespace-nowrap min-h-[40px]"
                  >
                    <div class="w-6 h-6 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center font-bold text-xs shrink-0">
                      ${esc(user.fullName.charAt(0).toUpperCase())}
                    </div>
                    <span class="max-w-[100px] truncate hidden sm:inline">${esc(user.fullName)}</span>
                    <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                  </button>

                  <!-- Dropdown user menu -->
                  <div
                    id="user-menu-dropdown"
                    class="hidden absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs sm:text-sm font-semibold"
                  >
                    <div class="px-4 py-2 border-b border-slate-100">
                      <p class="font-bold text-slate-900 truncate">${esc(user.fullName)}</p>
                      <p class="text-slate-500 text-xs truncate">${esc(user.email)}</p>
                    </div>

                    ${!isStaffOrAdmin ? `
                      <a href="/my-orders.html" class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                        <i data-lucide="package-check" class="w-4 h-4 text-slate-400"></i>
                        <span>Đơn hàng của tôi</span>
                      </a>
                    ` : ''}

                    <a href="/warranty.html" class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700">
                      <i data-lucide="shield-check" class="w-4 h-4 text-slate-400"></i>
                      <span>Tra cứu bảo hành</span>
                    </a>

                    ${isStaffOrAdmin ? `
                      <a href="/admin/orders.html" class="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-[#DC2626] border-t border-slate-100 font-bold">
                        <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                        <span>Cổng quản trị</span>
                      </a>
                    ` : ''}

                    <div class="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      id="btn-header-logout"
                      class="w-full flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-600 text-left font-bold"
                    >
                      <i data-lucide="log-out" class="w-4 h-4"></i>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                ` : `
                  <a
                    href="/login.html"
                    class="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-[#DC2626] hover:border-[#DC2626] font-bold text-xs sm:text-sm transition-colors shrink-0 whitespace-nowrap min-h-[40px]"
                  >
                    <i data-lucide="user" class="w-4 h-4 text-[#DC2626]"></i>
                    <span class="hidden sm:inline">Đăng nhập</span>
                  </a>
                `}
              </div>

            </div>
          </div>
        </div>
      </header>
    `;

    bindHeaderEvents();
    window.lucide?.createIcons();
  };

  const bindHeaderEvents = () => {
    // 1. Toggle danh mục dropdown
    const catToggle = $('#btn-category-toggle', root);
    const catDropdown = $('#category-dropdown', root);
    const catCaret = $('#category-caret', root);

    if (catToggle && catDropdown) {
      catToggle.onclick = (e) => {
        e.stopPropagation();
        const isOpen = !catDropdown.classList.contains('hidden');
        if (isOpen) {
          catDropdown.classList.add('hidden');
          catCaret?.classList.remove('rotate-180');
        } else {
          catDropdown.classList.remove('hidden');
          catCaret?.classList.add('rotate-180');
          $('#search-suggestions-container', root)?.classList.add('hidden');
          $('#user-menu-dropdown', root)?.classList.add('hidden');
        }
      };
    }

    // 2. Toggle user menu dropdown
    const userToggle = $('#user-menu-toggle', root);
    const userDropdown = $('#user-menu-dropdown', root);
    if (userToggle && userDropdown) {
      userToggle.onclick = (e) => {
        e.stopPropagation();
        const isOpen = !userDropdown.classList.contains('hidden');
        if (isOpen) {
          userDropdown.classList.add('hidden');
        } else {
          userDropdown.classList.remove('hidden');
          catDropdown?.classList.add('hidden');
          catCaret?.classList.remove('rotate-180');
          $('#search-suggestions-container', root)?.classList.add('hidden');
        }
      };
    }

    // 3. Nút đăng xuất
    const logoutBtn = $('#btn-header-logout', root);
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        authStore.logoutClient();
        window.location.href = '/index.html';
      };
    }

    // 4. Ô tìm kiếm thông minh gợi ý (REQ-002)
    const searchInput = $('#search-input', root);
    const clearBtn = $('#search-clear-btn', root);
    const suggestContainer = $('#search-suggestions-container', root);
    let debounceTimer = null;
    let activeIndex = -1;
    let currentSuggestions = [];

    // Nạp sẵn query từ URL nếu có
    const urlParams = new URLSearchParams(window.location.search);
    const initialQ = urlParams.get('q');
    if (initialQ && searchInput) {
      searchInput.value = initialQ;
      clearBtn?.classList.remove('hidden');
    }

    const renderSuggestions = (items, query) => {
      if (!suggestContainer) return;
      currentSuggestions = items;
      activeIndex = -1;

      if (!query.trim()) {
        suggestContainer.innerHTML = '';
        suggestContainer.classList.add('hidden');
        searchInput?.setAttribute('aria-expanded', 'false');
        return;
      }

      suggestContainer.classList.remove('hidden');
      searchInput?.setAttribute('aria-expanded', 'true');

      let listHtml = '';
      if (items.length > 0) {
        listHtml = `
          <div class="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            <div class="px-3.5 py-1.5 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Sản phẩm gợi ý (${items.length})</span>
              <span class="text-[10px] text-slate-400 font-normal hidden sm:inline">Dùng phím ↑ ↓ để chọn</span>
            </div>
            ${items.map((item, idx) => {
              const prod = item.product || item;
              const prodImg = prod.images?.[0] || item.thumbnail || 'https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png';
              return `
              <a
                href="/product-detail.html?id=${prod.id}"
                id="suggestion-item-${idx}"
                role="option"
                class="suggestion-row w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer group hover:bg-slate-50 text-slate-800"
                data-index="${idx}"
              >
                <div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                  <img
                    src="${esc(prodImg)}"
                    alt="${esc(prod.name)}"
                    class="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm font-semibold line-clamp-2 break-words leading-tight transition-colors text-slate-900 group-hover:text-[#DC2626]">
                    ${esc(prod.name)}
                  </p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      ${esc(prod.brand)}
                    </span>
                    <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                      Trả góp 0%
                    </span>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <span class="text-xs sm:text-sm font-black text-[#DC2626] font-mono block whitespace-nowrap">
                    ${formatVND(item.minPrice || 0)}
                  </span>
                </div>
              </a>
            `;
            }).join('')}
          </div>
        `;
      } else {
        listHtml = `
          <div class="px-4 py-5 text-center">
            <p class="text-xs sm:text-sm font-medium text-slate-600">
              Không tìm thấy sản phẩm gợi ý nào cho <strong class="text-slate-900">"${esc(query)}"</strong>
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Thử tìm kiếm với tên khác hoặc xem toàn bộ kết quả bên dưới
            </p>
          </div>
        `;
      }

      suggestContainer.innerHTML = `
        <div
          id="search-suggestions"
          role="listbox"
          aria-label="Gợi ý sản phẩm"
          class="absolute left-0 right-0 top-full mt-1.5 z-[60] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 sm:min-w-[460px]"
        >
          ${listHtml}
          <a
            id="btn-view-all-results"
            href="/index.html?q=${encodeURIComponent(query)}"
            class="w-full px-4 py-2.5 bg-slate-50 hover:bg-red-50 border-t border-slate-100 text-left flex items-center justify-between text-xs font-bold text-[#DC2626] transition-colors cursor-pointer block"
          >
            <span class="truncate">Xem tất cả kết quả cho <span class="underline underline-offset-2">"${esc(query)}"</span></span>
            <i data-lucide="arrow-right" class="w-4 h-4 shrink-0 ml-2 inline-block"></i>
          </a>
        </div>
      `;

      window.lucide?.createIcons();
    };

    if (searchInput) {
      searchInput.oninput = () => {
        const val = searchInput.value;
        if (val.trim()) {
          clearBtn?.classList.remove('hidden');
        } else {
          clearBtn?.classList.add('hidden');
        }

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          if (!val.trim()) {
            renderSuggestions([], '');
            return;
          }
          const items = await searchSuggestions(val.trim(), 6);
          renderSuggestions(items, val.trim());
        }, 200);
      };

      searchInput.onkeydown = (e) => {
        if (!suggestContainer || suggestContainer.classList.contains('hidden')) return;

        const rows = suggestContainer.querySelectorAll('.suggestion-row');
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (rows.length > 0) {
            activeIndex = (activeIndex + 1) % rows.length;
            rows.forEach((r, idx) => {
              r.classList.toggle('bg-red-50/90', idx === activeIndex);
              r.classList.toggle('text-[#DC2626]', idx === activeIndex);
            });
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (rows.length > 0) {
            activeIndex = (activeIndex - 1 + rows.length) % rows.length;
            rows.forEach((r, idx) => {
              r.classList.toggle('bg-red-50/90', idx === activeIndex);
              r.classList.toggle('text-[#DC2626]', idx === activeIndex);
            });
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          suggestContainer.classList.add('hidden');
          searchInput.setAttribute('aria-expanded', 'false');
        } else if (e.key === 'Enter') {
          if (activeIndex >= 0 && currentSuggestions[activeIndex]) {
            e.preventDefault();
            const targetProd = currentSuggestions[activeIndex].product || currentSuggestions[activeIndex];
            window.location.href = `/product-detail.html?id=${targetProd.id}`;
          }
        }
      };

      searchInput.onfocus = () => {
        if (searchInput.value.trim() && currentSuggestions.length > 0) {
          suggestContainer?.classList.remove('hidden');
        }
      };
    }

    if (clearBtn) {
      clearBtn.onclick = () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        clearBtn.classList.add('hidden');
        renderSuggestions([], '');
      };
    }

    // Đóng dropdown khi click outside
    document.addEventListener('click', (e) => {
      const searchBox = $('#search-container', root);
      if (searchBox && !searchBox.contains(e.target)) {
        suggestContainer?.classList.add('hidden');
      }

      const catBox = $('#category-wrapper', root);
      if (catBox && !catBox.contains(e.target)) {
        catDropdown?.classList.add('hidden');
        catCaret?.classList.remove('rotate-180');
      }

      const userBox = $('#user-menu-wrapper', root);
      if (userBox && !userBox.contains(e.target)) {
        userDropdown?.classList.add('hidden');
      }
    });
  };

  render();

  // Đăng ký subscribe giỏ hàng để cập nhật badge thời gian thực
  cartStore.subscribe((state) => {
    const badge = $('#cart-badge', root);
    const countText = $('#cart-count-text', root);
    const count = cartStore.count();
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }
    if (countText) {
      countText.textContent = count;
    }
  });

  // Đăng ký subscribe auth
  authStore.subscribeClient(() => {
    render();
  });
}
