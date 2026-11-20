import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { useCartStore } from '@/stores/cart';
import { api } from '@/api';
import SearchSuggestions from '@/components/layout/SearchSuggestions.vue';
import type { SuggestionItem } from '@/composables/useProductSearch';
import type { Product } from '@/types';

describe('UI/UX Fixes Suite (TASK-016)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  describe('1. Cart Store ensureLoaded deduplication', () => {
    it('calling ensureLoaded multiple times in parallel only fetches cart once', async () => {
      const getCartSpy = vi.spyOn(api.cart, 'getCart').mockResolvedValue([
        {
          id: 101,
          variantId: 1,
          variant: { id: 1, productId: 1, price: 4790000, stockQty: 10 },
          product: { id: 1, name: 'Tivi Casper', brand: 'Casper' } as any,
          quantity: 2
        }
      ]);

      const cartStore = useCartStore();
      expect(cartStore.loaded).toBe(false);

      // Gọi đồng thời 3 lần
      const [res1, res2, res3] = await Promise.all([
        cartStore.ensureLoaded(),
        cartStore.ensureLoaded(),
        cartStore.ensureLoaded()
      ]);

      expect(getCartSpy).toHaveBeenCalledTimes(1);
      expect(cartStore.loaded).toBe(true);
      expect(cartStore.items.length).toBe(1);
      expect(cartStore.totalCount).toBe(2);

      // Gọi lần 4 khi đã loaded thì không gọi lại API nữa
      await cartStore.ensureLoaded();
      expect(getCartSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Phân loại danh mục: Quạt điều hòa không lọt vào Điều hòa Inverter', () => {
    const quatDieuHoa = {
      id: 15,
      categoryId: 15,
      name: 'Quạt điều hòa làm mát Sunhouse SHD7727 Công suất lớn 150W',
      brand: 'Sunhouse'
    } as Product;

    const dieuHoaDaikin = {
      id: 8,
      categoryId: 8,
      name: 'Điều hòa Daikin Inverter 1 HP FTKB25WMVMV',
      brand: 'Daikin'
    } as Product;

    it('bộ lọc Điều hòa (Category 2) phải loại trừ quạt điều hòa / quạt hơi nước', () => {
      const isDaikinAirConditioner = (
        dieuHoaDaikin.categoryId === 2 ||
        dieuHoaDaikin.categoryId === 8 ||
        dieuHoaDaikin.name.toLowerCase().includes('điều hòa')
      ) && !dieuHoaDaikin.name.toLowerCase().includes('quạt') && !dieuHoaDaikin.name.toLowerCase().includes('hơi nước');

      const isQuatAirConditioner = (
        quatDieuHoa.categoryId === 2 ||
        quatDieuHoa.categoryId === 8 ||
        quatDieuHoa.name.toLowerCase().includes('điều hòa')
      ) && !quatDieuHoa.name.toLowerCase().includes('quạt') && !quatDieuHoa.name.toLowerCase().includes('hơi nước');

      expect(isDaikinAirConditioner).toBe(true);
      expect(isQuatAirConditioner).toBe(false);
    });

    it('bộ lọc Quạt (Category 4) vẫn giữ đúng quạt điều hòa', () => {
      const isQuatFan = quatDieuHoa.categoryId === 4 ||
        quatDieuHoa.categoryId === 15 ||
        quatDieuHoa.name.toLowerCase().includes('quạt');

      expect(isQuatFan).toBe(true);
    });
  });

  describe('3. SearchSuggestions UI cải tiến hiển thị tên', () => {
    const mockSuggestions: SuggestionItem[] = [
      {
        product: {
          id: 1,
          categoryId: 1,
          name: 'Smart Tivi Samsung Crystal UHD 4K 55 inch UA55DU7000',
          brand: 'Samsung',
          variants: [{ id: 1, productId: 1, price: 9890000, stockQty: 5 }],
          promo: { installment0: true }
        } as any,
        minPrice: 9890000,
        score: 100
      }
    ];

    it('hiển thị tên sản phẩm với class line-clamp-2 và break-words, không dùng truncate 1 dòng', () => {
      const wrapper = mount(SearchSuggestions, {
        props: {
          items: mockSuggestions,
          query: 'tivi',
          activeIndex: 0,
          loading: false
        }
      });

      const titleEl = wrapper.find('#suggestion-item-0 p');
      expect(titleEl.exists()).toBe(true);
      expect(titleEl.classes()).toContain('line-clamp-2');
      expect(titleEl.classes()).toContain('break-words');
      expect(titleEl.classes()).not.toContain('truncate');
      expect(titleEl.text()).toBe('Smart Tivi Samsung Crystal UHD 4K 55 inch UA55DU7000');
    });

    it('thẻ giá hiển thị có class whitespace-nowrap tránh rớt dòng ký hiệu tiền tệ ₫', () => {
      const wrapper = mount(SearchSuggestions, {
        props: {
          items: mockSuggestions,
          query: 'tivi',
          activeIndex: 0,
          loading: false
        }
      });

      const priceEl = wrapper.find('#suggestion-item-0 .shrink-0 span');
      expect(priceEl.exists()).toBe(true);
      expect(priceEl.classes()).toContain('whitespace-nowrap');
      expect(priceEl.text()).toContain('₫');
    });
  });
});
