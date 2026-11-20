/**
 * Script trang chủ Điện Máy Pha Hằng (index.html)
 * Nâng cấp UX:
 * - Tự động lọc (Auto-filter) khi thay đổi bất kỳ dropdown nào, không cần ấn nút.
 * - Danh sách Thương hiệu cập nhật động theo ngành hàng được chọn.
 * - Dải thẻ lọc đang hoạt động (Active Filter Chips) có nút xóa nhanh từng tiêu chí.
 * - Tiện ích 1-Click sao chép mã giảm giá PHAHANG50K trên banner.
 */
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { mockService } from '../services/mockService.js';
import { renderProductCard } from '../components/productCard.js';
import { esc, getQueryParam } from '../core/dom.js';
import { cartStore } from '../stores/cartStore.js';
import { copyToClipboard } from '../core/validate.js';

const categoryMeta = {
  1: { id: 1, name: 'Ti vi Smart 4K & OLED', shortName: 'Ti vi', icon: 'tv', brands: ['Sony', 'Samsung', 'LG', 'Casper'] },
  2: { id: 2, name: 'Điều hòa Inverter Tiết Kiệm Điện', shortName: 'Điều hòa', icon: 'wind', brands: ['Daikin', 'Panasonic', 'Casper'] },
  3: { id: 3, name: 'Tủ lạnh Ngăn đông & Side-by-side', shortName: 'Tủ lạnh', icon: 'snowflake', brands: ['Aqua', 'Samsung', 'Toshiba'] },
  4: { id: 4, name: 'Quạt làm mát & Điều hòa hơi nước', shortName: 'Quạt', icon: 'fan', brands: ['Senko', 'Panasonic', 'Sunhouse'] },
  5: { id: 5, name: 'Nồi cơm điện tử & Cao tần IH', shortName: 'Nồi cơm điện', icon: 'utensils-crossed', brands: ['Cuckoo', 'Toshiba', 'Sunhouse'] }
};

const allBrands = ['Sony', 'Samsung', 'LG', 'Daikin', 'Panasonic', 'Casper', 'Aqua', 'Toshiba', 'Senko', 'Cuckoo', 'Sunhouse'];

const priceRangeLabels = {
  '0-2000000': 'Dưới 2 triệu',
  '2000000-5000000': 'Từ 2 - 5 triệu',
  '5000000-10000000': 'Từ 5 - 10 triệu',
  '10000000-999999999': 'Trên 10 triệu'
};

const sortLabels = {
  'price_asc': 'Giá: Thấp đến cao',
  'price_desc': 'Giá: Cao đến thấp',
  'name_asc': 'Tên A-Z'
};

let currentFilter = {
  categoryId: getQueryParam('category') || '',
  brand: getQueryParam('brand') || '',
  priceRange: getQueryParam('price') || '',
  sort: getQueryParam('sort') || 'newest',
  q: getQueryParam('q') || '',
  page: Number(getQueryParam('page')) || 1,
  limit: 12
};

export async function initHomePage() {
  mountHeader();
  mountFooter();
  await cartStore.ensureLoaded();

  updateBrandDropdownOptions(currentFilter.categoryId);
  initFilterValues();
  bindFilterEvents();
  await loadAndRender();

  // Tiện ích sao chép mã banner
  document.getElementById('hero-coupon-btn')?.addEventListener('click', () => {
    copyToClipboard('PHAHANG50K', 'Đã sao chép mã PHAHANG50K! Giảm ngay 50.000 ₫ khi đặt hàng.');
  });
}

function updateBrandDropdownOptions(catId) {
  const allowedBrands = catId && categoryMeta[catId] ? categoryMeta[catId].brands : allBrands;

  const populateSelect = (selectId) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const currentVal = sel.value || currentFilter.brand;

    let html = '<option value="">Tất cả thương hiệu</option>';
    allowedBrands.forEach(b => {
      html += `<option value="${esc(b)}">${esc(b)}</option>`;
    });
    sel.innerHTML = html;

    if (allowedBrands.includes(currentVal)) {
      sel.value = currentVal;
    } else {
      sel.value = '';
      currentFilter.brand = '';
    }
  };

  populateSelect('filter-brand');
  populateSelect('mobile-filter-brand');
}

export function isProductInCategory(p, catId) {
  catId = Number(catId);
  const pCat = Number(p.categoryId);
  const name = (p.name || '').toLowerCase();

  if (catId === 1) {
    return pCat === 1 || pCat === 6 || pCat === 7 || name.includes('tivi') || name.includes('tv');
  }
  if (catId === 2) {
    return (pCat === 2 || pCat === 8 || pCat === 9 || name.includes('điều hòa') || name.includes('máy lạnh')) &&
      !name.includes('quạt') && !name.includes('hơi nước');
  }
  if (catId === 3) {
    return pCat === 3 || pCat === 10 || pCat === 11 || pCat === 12 || name.includes('tủ lạnh');
  }
  if (catId === 4) {
    return pCat === 4 || pCat === 13 || pCat === 14 || pCat === 15 || name.includes('quạt');
  }
  if (catId === 5) {
    return pCat === 5 || pCat === 16 || pCat === 17 || pCat === 18 || name.includes('nồi cơm');
  }
  return pCat === catId;
}

function initFilterValues() {
  const setSelect = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setSelect('filter-category', currentFilter.categoryId);
  setSelect('filter-brand', currentFilter.brand);
  setSelect('filter-price', currentFilter.priceRange);
  setSelect('filter-sort', currentFilter.sort);

  setSelect('mobile-filter-category', currentFilter.categoryId);
  setSelect('mobile-filter-brand', currentFilter.brand);
  setSelect('mobile-filter-price', currentFilter.priceRange);
  setSelect('mobile-filter-sort', currentFilter.sort);

  // Highlight quick category button (mobile + desktop)
  const quickBtns = document.querySelectorAll('.quick-cat-btn, .quick-mobile-cat');
  quickBtns.forEach(btn => {
    const cat = btn.dataset.category;
    if (String(currentFilter.categoryId) === String(cat)) {
      btn.classList.add('border-[#DC2626]', 'bg-[#DC2626]', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-700');
    } else {
      btn.classList.remove('border-[#DC2626]', 'bg-[#DC2626]', 'text-white');
      btn.classList.add('bg-white', 'text-slate-700');
    }
  });
}

async function loadAndRender() {
  const groupedContainer = document.getElementById('grouped-categories-container');
  const flatGrid = document.getElementById('flat-product-grid');
  const filterHeader = document.getElementById('filter-header');
  const emptyState = document.getElementById('empty-state');
  const paginationContainer = document.getElementById('pagination-container');
  const chipsContainer = document.getElementById('active-chips-container');

  const isFiltered = Boolean(
    currentFilter.categoryId ||
    currentFilter.brand ||
    currentFilter.priceRange ||
    currentFilter.q ||
    (currentFilter.sort && currentFilter.sort !== 'newest')
  );

  renderActiveChips(chipsContainer, isFiltered);

  let [minPrice, maxPrice] = [null, null];
  if (currentFilter.priceRange) {
    const parts = currentFilter.priceRange.split('-');
    if (parts.length === 2) {
      minPrice = Number(parts[0]) || null;
      maxPrice = Number(parts[1]) || null;
    }
  }

  if (!isFiltered) {
    // MẶC ĐỊNH: Hiển thị Grouped View theo từng ngành hàng (5 khối lớn)
    groupedContainer?.classList.remove('hidden');
    flatGrid?.classList.add('hidden');
    filterHeader?.classList.add('hidden');
    emptyState?.classList.add('hidden');
    if (paginationContainer) paginationContainer.innerHTML = '';

    const res = await mockService.getProducts({ limit: 100 });
    const allProducts = Array.isArray(res) ? res : (res?.items || res?.data || []);

    if (groupedContainer) {
      groupedContainer.innerHTML = Object.entries(categoryMeta).map(([catId, meta]) => {
        const catProds = allProducts.filter(p => isProductInCategory(p, Number(catId))).slice(0, 4);
        if (catProds.length === 0) return '';

        return `
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center font-bold">
                  <i data-lucide="${meta.icon}" class="w-4 h-4"></i>
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">${meta.name}</h3>
                  <p class="text-[11px] text-slate-500 hidden sm:block">Chính hãng: ${meta.brands.join(', ')}</p>
                </div>
              </div>

              <a
                href="/index.html?category=${catId}"
                class="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả ${meta.shortName}</span>
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </a>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              ${catProds.map(p => renderProductCard(p)).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  } else {
    // KHI CÓ LỌC HOẶC TÌM KIẾM: Hiển thị Flat Grid phẳng
    groupedContainer?.classList.add('hidden');
    filterHeader?.classList.remove('hidden');

    const titleEl = document.getElementById('filter-title');
    const badgeEl = document.getElementById('product-count-badge');

    let titleText = 'Tất Cả Sản Phẩm';
    if (currentFilter.q) {
      titleText = `Kết quả tìm kiếm cho "${esc(currentFilter.q)}"`;
    } else if (currentFilter.categoryId && categoryMeta[currentFilter.categoryId]) {
      titleText = categoryMeta[currentFilter.categoryId].name;
    }
    if (titleEl) titleEl.textContent = titleText;

    const query = {
      categoryId: currentFilter.categoryId,
      brand: currentFilter.brand,
      minPrice,
      maxPrice,
      sort: currentFilter.sort,
      q: currentFilter.q,
      page: currentFilter.page,
      limit: currentFilter.limit
    };

    const res = await mockService.getProducts(query);
    const products = Array.isArray(res) ? res : (res?.items || res?.data || []);
    const total = res?.total ?? products.length;
    const totalPages = res?.totalPages ?? 1;

    if (badgeEl) {
      badgeEl.textContent = `${total} sản phẩm`;
    }

    if (products.length > 0) {
      flatGrid?.classList.remove('hidden');
      emptyState?.classList.add('hidden');
      if (flatGrid) {
        flatGrid.innerHTML = products.map(p => renderProductCard(p)).join('');
      }

      // Render Phân trang UI-10
      renderPagination(totalPages, currentFilter.page, paginationContainer);
    } else {
      flatGrid?.classList.add('hidden');
      emptyState?.classList.remove('hidden');
      if (paginationContainer) paginationContainer.innerHTML = '';
    }
  }

  window.lucide?.createIcons();
}

function renderActiveChips(container, isFiltered) {
  if (!container) return;

  if (!isFiltered) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  const chips = [];

  if (currentFilter.categoryId && categoryMeta[currentFilter.categoryId]) {
    chips.push({
      key: 'categoryId',
      label: `Ngành hàng: ${categoryMeta[currentFilter.categoryId].shortName}`
    });
  }

  if (currentFilter.brand) {
    chips.push({
      key: 'brand',
      label: `Hãng: ${currentFilter.brand}`
    });
  }

  if (currentFilter.priceRange && priceRangeLabels[currentFilter.priceRange]) {
    chips.push({
      key: 'priceRange',
      label: priceRangeLabels[currentFilter.priceRange]
    });
  }

  if (currentFilter.sort && sortLabels[currentFilter.sort]) {
    chips.push({
      key: 'sort',
      label: `Xếp: ${sortLabels[currentFilter.sort]}`
    });
  }

  if (currentFilter.q) {
    chips.push({
      key: 'q',
      label: `Từ khóa: "${currentFilter.q}"`
    });
  }

  if (chips.length === 0) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = `
    <span class="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
      <i data-lucide="filter" class="w-3.5 h-3.5 text-[#DC2626]"></i>
      <span>Đang lọc:</span>
    </span>

    ${chips.map(chip => `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#DC2626] border border-red-200 text-xs font-semibold shadow-2xs">
        <span>${esc(chip.label)}</span>
        <button
          type="button"
          class="chip-remove-btn w-4 h-4 rounded-full hover:bg-red-200/60 inline-flex items-center justify-center cursor-pointer transition-colors"
          data-key="${chip.key}"
          title="Bỏ tiêu chí này"
        >
          ✕
        </button>
      </span>
    `).join('')}

    <button
      type="button"
      id="btn-clear-all-chips"
      class="text-xs font-bold text-slate-500 hover:text-[#DC2626] hover:underline ml-2 cursor-pointer"
    >
      Xóa tất cả
    </button>
  `;

  // Gắn sự kiện xóa từng chip
  container.querySelectorAll('.chip-remove-btn').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.key;
      if (key === 'categoryId') currentFilter.categoryId = '';
      else if (key === 'brand') currentFilter.brand = '';
      else if (key === 'priceRange') currentFilter.priceRange = '';
      else if (key === 'sort') currentFilter.sort = 'newest';
      else if (key === 'q') currentFilter.q = '';
      currentFilter.page = 1;

      updateBrandDropdownOptions(currentFilter.categoryId);
      initFilterValues();
      applyQueryToUrl();
      loadAndRender();
    };
  });

  const clearAllBtn = container.querySelector('#btn-clear-all-chips');
  if (clearAllBtn) {
    clearAllBtn.onclick = () => {
      window.location.href = '/index.html';
    };
  }
}

function renderPagination(totalPages, currentPage, container) {
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let pagesHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentPage;
    pagesHtml += `
      <button
        type="button"
        class="page-num-btn w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${isActive ? 'bg-[#DC2626] text-white shadow-xs' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'}"
        data-page="${i}"
      >
        ${i}
      </button>
    `;
  }

  container.innerHTML = `
    <div class="flex items-center justify-center gap-2 pt-6 border-t border-slate-200 text-xs font-bold select-none">
      <button
        type="button"
        id="btn-prev-page"
        ${currentPage <= 1 ? 'disabled' : ''}
        class="h-9 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
      >
        <i data-lucide="chevron-left" class="w-4 h-4"></i>
        <span class="hidden sm:inline">Trước</span>
      </button>

      <div class="flex items-center gap-1">
        ${pagesHtml}
      </div>

      <button
        type="button"
        id="btn-next-page"
        ${currentPage >= totalPages ? 'disabled' : ''}
        class="h-9 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
      >
        <span class="hidden sm:inline">Sau</span>
        <i data-lucide="chevron-right" class="w-4 h-4"></i>
      </button>
    </div>
  `;

  const prevBtn = document.getElementById('btn-prev-page');
  const nextBtn = document.getElementById('btn-next-page');

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentFilter.page > 1) {
        goToPage(currentFilter.page - 1);
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentFilter.page < totalPages) {
        goToPage(currentFilter.page + 1);
      }
    };
  }

  container.querySelectorAll('.page-num-btn').forEach(btn => {
    btn.onclick = () => {
      const page = Number(btn.dataset.page);
      if (page) goToPage(page);
    };
  });
}

function goToPage(page) {
  currentFilter.page = page;
  applyQueryToUrl();
  loadAndRender();
  document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applyQueryToUrl() {
  const params = new URLSearchParams();
  if (currentFilter.categoryId) params.set('category', currentFilter.categoryId);
  if (currentFilter.brand) params.set('brand', currentFilter.brand);
  if (currentFilter.priceRange) params.set('price', currentFilter.priceRange);
  if (currentFilter.sort && currentFilter.sort !== 'newest') params.set('sort', currentFilter.sort);
  if (currentFilter.q) params.set('q', currentFilter.q);
  if (currentFilter.page > 1) params.set('page', currentFilter.page);

  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.pushState({}, '', newUrl);
}

function bindFilterEvents() {
  const onFilterChange = (catVal, brandVal, priceVal, sortVal) => {
    const prevCat = currentFilter.categoryId;
    currentFilter.categoryId = catVal || '';
    currentFilter.brand = brandVal || '';
    currentFilter.priceRange = priceVal || '';
    currentFilter.sort = sortVal || 'newest';
    currentFilter.page = 1;

    if (prevCat !== currentFilter.categoryId) {
      updateBrandDropdownOptions(currentFilter.categoryId);
    }

    applyQueryToUrl();
    initFilterValues();
    loadAndRender();
  };

  // Tự động lọc khi đổi select trên desktop
  ['filter-category', 'filter-brand', 'filter-price', 'filter-sort'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = () => {
        onFilterChange(
          document.getElementById('filter-category')?.value,
          document.getElementById('filter-brand')?.value,
          document.getElementById('filter-price')?.value,
          document.getElementById('filter-sort')?.value
        );
      };
    }
  });

  // Tự động lọc khi đổi select trên mobile
  ['mobile-filter-category', 'mobile-filter-brand', 'mobile-filter-price', 'mobile-filter-sort'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = () => {
        onFilterChange(
          document.getElementById('mobile-filter-category')?.value,
          document.getElementById('mobile-filter-brand')?.value,
          document.getElementById('mobile-filter-price')?.value,
          document.getElementById('mobile-filter-sort')?.value
        );
      };
    }
  });

  // Form submit dự phòng
  const desktopForm = document.getElementById('filter-form-desktop');
  if (desktopForm) {
    desktopForm.onsubmit = (e) => {
      e.preventDefault();
      onFilterChange(
        document.getElementById('filter-category')?.value,
        document.getElementById('filter-brand')?.value,
        document.getElementById('filter-price')?.value,
        document.getElementById('filter-sort')?.value
      );
    };
  }

  const mobileForm = document.getElementById('filter-form-mobile');
  if (mobileForm) {
    mobileForm.onsubmit = (e) => {
      e.preventDefault();
      onFilterChange(
        document.getElementById('mobile-filter-category')?.value,
        document.getElementById('mobile-filter-brand')?.value,
        document.getElementById('mobile-filter-price')?.value,
        document.getElementById('mobile-filter-sort')?.value
      );
      document.getElementById('mobile-filter-drawer')?.classList.add('hidden');
    };
  }

  const resetDesktop = document.getElementById('btn-desktop-reset-filter');
  if (resetDesktop) {
    resetDesktop.onclick = () => {
      window.location.href = '/index.html';
    };
  }

  const openDrawerBtn = document.getElementById('btn-mobile-filter-open');
  const closeDrawerBtn = document.getElementById('btn-mobile-filter-close');
  const drawer = document.getElementById('mobile-filter-drawer');

  if (openDrawerBtn && drawer) {
    openDrawerBtn.onclick = () => drawer.classList.remove('hidden');
  }
  if (closeDrawerBtn && drawer) {
    closeDrawerBtn.onclick = () => drawer.classList.add('hidden');
  }
  if (drawer) {
    drawer.onclick = (e) => {
      if (e.target === drawer) drawer.classList.add('hidden');
    };
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initHomePage();
}
