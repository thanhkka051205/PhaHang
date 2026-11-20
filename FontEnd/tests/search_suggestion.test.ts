import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import {
  normalizeSearchText,
  calculateMinPrice,
  ensureProductsLoaded,
  searchSuggestions,
  _resetSearchIndexForTesting
} from '../src/composables/useProductSearch';
import SearchSuggestions from '../src/components/layout/SearchSuggestions.vue';
import AppHeader from '../src/components/layout/AppHeader.vue';
import type { Product } from '../src/types';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/warranty', component: { template: '<div>Warranty</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/cart', component: { template: '<div>Cart</div>' } },
    { path: '/my-orders', component: { template: '<div>My Orders</div>' } },
    { path: '/products/:id', component: { template: '<div>Product Detail</div>' } }
  ]
});

const mockProducts: Product[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Smart Tivi Samsung Crystal UHD 4K 55 inch UA55DU7000',
    brand: 'Samsung',
    warrantyMonths: 24,
    trackSerial: 1,
    isVisible: true,
    images: ['https://example.com/tv-samsung.jpg'],
    variants: [
      { id: 101, productId: 1, spec: '55 inch', color: 'Đen', price: 9890000, stockQty: 10 },
      { id: 102, productId: 1, spec: '65 inch', color: 'Đen', price: 12490000, stockQty: 5 }
    ]
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Google Tivi Sony 4K 55 inch KD-55X75K Bravia',
    brand: 'Sony',
    warrantyMonths: 24,
    trackSerial: 1,
    isVisible: true,
    images: ['https://example.com/tv-sony.jpg'],
    variants: [
      { id: 201, productId: 2, spec: '55 inch', color: 'Đen', price: 11990000, stockQty: 7 }
    ]
  },
  {
    id: 3,
    categoryId: 2,
    name: 'Điều hòa Daikin Inverter 1 chiều 9.000 BTU FTKF25XVMV',
    brand: 'Daikin',
    warrantyMonths: 12,
    trackSerial: 1,
    isVisible: true,
    images: ['https://example.com/dieu-hoa-daikin.jpg'],
    variants: [
      { id: 301, productId: 3, spec: '9.000 BTU', color: 'Trắng', price: 8990000, stockQty: 12 }
    ]
  },
  {
    id: 4,
    categoryId: 4,
    name: 'Quạt đứng Senko có Remote DR1608',
    brand: 'Senko',
    warrantyMonths: 12,
    trackSerial: 0,
    isVisible: true,
    images: ['https://example.com/quat-senko.jpg'],
    variants: [
      { id: 401, productId: 4, spec: 'Quạt đứng', color: 'Xám', price: 499000, stockQty: 20 }
    ]
  },
  {
    id: 5,
    categoryId: 5,
    name: 'Nồi cơm điện cao tần Cuckoo 1.08L CRP-LHTR0610FW',
    brand: 'Cuckoo',
    warrantyMonths: 24,
    trackSerial: 0,
    isVisible: true,
    images: ['https://example.com/noi-com-cuckoo.jpg'],
    variants: [
      { id: 501, productId: 5, spec: '1.08L', color: 'Trắng', price: 6890000, stockQty: 4 }
    ]
  }
];

describe('useProductSearch Composable (REQ-002)', () => {
  beforeEach(() => {
    _resetSearchIndexForTesting();
  });

  it('chuẩn hóa chuỗi không dấu chính xác qua normalizeSearchText', () => {
    expect(normalizeSearchText('Điều hòa Inverter')).toBe('dieu hoa inverter');
    expect(normalizeSearchText('Nồi cơm điện')).toBe('noi com dien');
    expect(normalizeSearchText('TỦ LẠNH')).toBe('tu lanh');
  });

  it('tính toán minPrice an toàn và xử lý danh sách rỗng', () => {
    expect(calculateMinPrice(mockProducts[0])).toBe(9890000);
    expect(calculateMinPrice({ ...mockProducts[0], variants: [] })).toBe(0);
  });

  it('tìm kiếm gợi ý sản phẩm theo từ khóa có dấu và không dấu', async () => {
    // Nạp dữ liệu thực tế từ mock service
    await ensureProductsLoaded();

    // 1. Tìm không dấu "dieu hoa"
    const acResults = searchSuggestions('dieu hoa', 6);
    expect(acResults.length).toBeGreaterThan(0);
    expect(acResults.some(r => normalizeSearchText(r.product.name).includes('dieu hoa'))).toBe(true);

    // 2. Tìm có dấu "Tivi"
    const tvResults = searchSuggestions('Tivi', 6);
    expect(tvResults.length).toBeGreaterThan(0);
    expect(tvResults.some(r => r.product.name.includes('Tivi'))).toBe(true);

    // 3. Tìm theo tên hãng "Senko"
    const brandResults = searchSuggestions('senko', 6);
    expect(brandResults.length).toBeGreaterThan(0);
    expect(brandResults[0].product.brand).toBe('Senko');

    // 4. Tìm không khớp từ nào
    const noResults = searchSuggestions('chuotkhongdayxyz', 6);
    expect(noResults.length).toBe(0);
  });

  it('giới hạn số lượng gợi ý trả về theo tham số limit', async () => {
    await ensureProductsLoaded();
    const results = searchSuggestions('a', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

describe('SearchSuggestions Component (REQ-002)', () => {
  const items = [
    {
      product: mockProducts[0],
      key: normalizeSearchText(mockProducts[0].name),
      minPrice: 9890000
    },
    {
      product: mockProducts[1],
      key: normalizeSearchText(mockProducts[1].name),
      minPrice: 11990000
    }
  ];

  it('hiển thị danh sách gợi ý với tên, giá VNĐ và ảnh', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        items,
        query: 'tivi',
        activeIndex: -1,
        loading: false
      }
    });

    expect(wrapper.text()).toContain('Smart Tivi Samsung Crystal UHD');
    expect(wrapper.text()).toContain('Google Tivi Sony 4K');
    expect(wrapper.text()).toContain('9.890.000 ₫');
    expect(wrapper.text()).toContain('11.990.000 ₫');
    expect(wrapper.text()).toContain('Xem tất cả kết quả cho "tivi"');
  });

  it('emit sự kiện select khi bấm vào sản phẩm', async () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        items,
        query: 'tivi',
        activeIndex: 0,
        loading: false
      }
    });

    const buttons = wrapper.findAll('button[role="option"]');
    await buttons[0].trigger('click');

    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0][0]).toEqual(mockProducts[0]);
  });

  it('emit sự kiện viewAll khi bấm nút xem tất cả kết quả', async () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        items,
        query: 'tivi',
        activeIndex: -1,
        loading: false
      }
    });

    const allBtn = wrapper.find('#btn-view-all-results');
    await allBtn.trigger('click');

    expect(wrapper.emitted('viewAll')).toBeTruthy();
  });

  it('hiển thị thông báo khi không có sản phẩm nào khớp', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        items: [],
        query: 'khongcotensanphamnay',
        activeIndex: -1,
        loading: false
      }
    });

    expect(wrapper.text()).toContain('Không tìm thấy sản phẩm gợi ý nào cho "khongcotensanphamnay"');
  });
});

describe('AppHeader Tích Hợp Gợi Ý Tìm Kiếm (REQ-002 / UI-01)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    _resetSearchIndexForTesting();
  });

  it('mở dropdown gợi ý khi người dùng gõ từ khóa và focus', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    const input = wrapper.find('input[type="text"]');
    await input.trigger('focus');
    await input.setValue('dieu hoa');

    // Chờ debounce timer 200ms
    await new Promise(r => setTimeout(r, 260));
    await wrapper.vm.$nextTick();

    const suggestionsBox = wrapper.find('#search-suggestions');
    expect(suggestionsBox.exists()).toBe(true);
  });

  it('đóng dropdown khi nhấn phím Escape', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    const input = wrapper.find('input[type="text"]');
    await input.trigger('focus');
    await input.setValue('tivi');

    await new Promise(r => setTimeout(r, 260));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#search-suggestions').exists()).toBe(true);

    // Gõ phím Escape
    await input.trigger('keydown', { key: 'Escape' });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#search-suggestions').exists()).toBe(false);
  });

  it('hỗ trợ điều hướng bằng phím mũi tên ArrowDown', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    const input = wrapper.find('input[type="text"]');
    await input.trigger('focus');
    await input.setValue('tivi');

    await new Promise(r => setTimeout(r, 260));
    await wrapper.vm.$nextTick();

    // Nhấn ArrowDown
    await input.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.vm.$nextTick();

    const activeOption = wrapper.find('[aria-selected="true"]');
    expect(activeOption.exists()).toBe(true);
  });
});
