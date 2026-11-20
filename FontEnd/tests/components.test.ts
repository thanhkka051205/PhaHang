import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from '../src/components/ui/BaseButton.vue';
import BaseBadge from '../src/components/ui/BaseBadge.vue';
import BaseInput from '../src/components/ui/BaseInput.vue';
import BatteryRing from '../src/components/product/BatteryRing.vue';
import ColorSwatch from '../src/components/product/ColorSwatch.vue';
import ConfigGrid from '../src/components/product/ConfigGrid.vue';
import ProductCard from '../src/components/product/ProductCard.vue';
import type { Product, ProductVariant } from '../src/types';

describe('BaseButton Component', () => {
  it('renders slot text correctly', () => {
    const wrapper = mount(BaseButton, {
      slots: { default: 'Thêm vào giỏ' }
    });
    expect(wrapper.text()).toContain('Thêm vào giỏ');
  });

  it('applies disabled state and loading spinner when loading=true', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
      slots: { default: 'Lưu' }
    });
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true);
    expect(wrapper.attributes('disabled')).toBeDefined();
  });
});

describe('BaseBadge Component', () => {
  it('renders status text and correct variant classes', () => {
    const wrapper = mount(BaseBadge, {
      props: { variant: 'success' },
      slots: { default: 'Còn Hiệu Lực' }
    });
    expect(wrapper.text()).toBe('Còn Hiệu Lực');
    expect(wrapper.classes()).toContain('text-emerald-400');
  });
});

describe('BaseInput Component (UI-05)', () => {
  it('renders required asterisk * when required is true', () => {
    const wrapper = mount(BaseInput, {
      props: { label: 'Họ và tên', required: true }
    });
    expect(wrapper.find('span.text-ember').exists()).toBe(true);
    expect(wrapper.text()).toContain('*');
  });

  it('renders Vietnamese error message underneath when error is provided', () => {
    const wrapper = mount(BaseInput, {
      props: { error: 'Số điện thoại phải gồm 10 chữ số.' }
    });
    expect(wrapper.text()).toContain('Số điện thoại phải gồm 10 chữ số.');
    expect(wrapper.find('p.text-rose-400').exists()).toBe(true);
  });
});

describe('BatteryRing Component (Độc bản Apple Retailer)', () => {
  it('renders green text and stroke for battery >= 90%', () => {
    const wrapper = mount(BatteryRing, {
      props: { percent: 95 }
    });
    expect(wrapper.text()).toContain('Pin 95%');
    expect(wrapper.find('span.text-emerald-400').exists()).toBe(true);
  });

  it('renders amber text and stroke for battery between 80% and 89%', () => {
    const wrapper = mount(BatteryRing, {
      props: { percent: 84 }
    });
    expect(wrapper.text()).toContain('Pin 84%');
    expect(wrapper.find('span.text-amber-400').exists()).toBe(true);
  });

  it('renders red text and stroke for battery < 80%', () => {
    const wrapper = mount(BatteryRing, {
      props: { percent: 76 }
    });
    expect(wrapper.text()).toContain('Pin 76%');
    expect(wrapper.find('span.text-rose-400').exists()).toBe(true);
  });
});

describe('ColorSwatch Component (Độc bản Apple Swatch)', () => {
  it('renders swatch buttons with correct title and colors', () => {
    const colors = ['Titan Tự Nhiên', 'Titan Sa Mạc', 'Titan Đen'];
    const wrapper = mount(ColorSwatch, {
      props: { colors, modelValue: 'Titan Tự Nhiên' }
    });
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].attributes('title')).toBe('Titan Tự Nhiên');
    expect(buttons[0].classes()).toContain('ring-ember');
  });

  it('emits update:modelValue event on swatch click', async () => {
    const colors = ['Titan Tự Nhiên', 'Titan Sa Mạc'];
    const wrapper = mount(ColorSwatch, {
      props: { colors, modelValue: 'Titan Tự Nhiên' }
    });
    const buttons = wrapper.findAll('button');
    await buttons[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Titan Sa Mạc']);
  });
});

describe('ConfigGrid Component (CellphoneS & TGDD Pattern)', () => {
  const sampleVariants: ProductVariant[] = [
    {
      id: 1,
      productId: 1,
      storage: '256GB',
      color: 'Titan Tự Nhiên',
      itemCondition: 'Mới 100%',
      price: 28990000,
      stockQty: 5
    },
    {
      id: 2,
      productId: 1,
      storage: '512GB',
      color: 'Titan Tự Nhiên',
      itemCondition: 'Zin Keng 99%',
      batteryPercent: 92,
      price: 32990000,
      stockQty: 0
    }
  ];

  it('renders storage and direct price in boxes', () => {
    const wrapper = mount(ConfigGrid, {
      props: { variants: sampleVariants, modelValue: sampleVariants[0] }
    });
    expect(wrapper.text()).toContain('256GB');
    expect(wrapper.text()).toContain('28.990.000 ₫');
  });

  it('disables out-of-stock variant and shows Hết label', () => {
    const wrapper = mount(ConfigGrid, {
      props: { variants: sampleVariants, modelValue: sampleVariants[0] }
    });
    const buttons = wrapper.findAll('button');
    expect(buttons[1].attributes('disabled')).toBeDefined();
    expect(buttons[1].text()).toContain('Hết');
  });

  it('emits update:modelValue when in-stock variant clicked', async () => {
    const wrapper = mount(ConfigGrid, {
      props: { variants: sampleVariants, modelValue: sampleVariants[1] }
    });
    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([sampleVariants[0]]);
  });
});

describe('ProductCard Component (Tinh gọn chuẩn CellphoneS & TGDD)', () => {
  const sampleProduct: Product = {
    id: 1,
    categoryId: 4,
    name: 'iPhone 15 Pro Max 256GB - VN/A',
    description: 'Flagship Titanium cao cấp',
    isVisible: true,
    images: ['https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png'],
    variants: [
      {
        id: 101,
        productId: 1,
        storage: '256GB',
        color: 'Titan Tự Nhiên',
        itemCondition: 'Mới',
        batteryPercent: 100,
        price: 28990000,
        stockQty: 8
      }
    ]
  };

  it('renders product title and formatted price correctly', () => {
    const wrapper = mount(ProductCard, {
      props: { product: sampleProduct },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    });
    expect(wrapper.text()).toContain('iPhone 15 Pro Max 256GB - VN/A');
    expect(wrapper.text()).toContain('28.990.000 ₫');
  });

  it('does NOT render redundant ColorSwatch buttons on product card (uncluttered)', () => {
    const wrapper = mount(ProductCard, {
      props: { product: sampleProduct },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    });
    expect(wrapper.findComponent(ColorSwatch).exists()).toBe(false);
  });

  it('shows out of stock overlay when total stock is 0', () => {
    const outOfStockProduct: Product = {
      ...sampleProduct,
      variants: [
        {
          ...sampleProduct.variants[0],
          stockQty: 0
        }
      ]
    };
    const wrapper = mount(ProductCard, {
      props: { product: outOfStockProduct },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    });
    expect(wrapper.text()).toContain('Hết hàng');
  });

  it('renders Xem chi tiết button for in-stock products according to Wireframe Hình 11', () => {
    const wrapper = mount(ProductCard, {
      props: { product: sampleProduct },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    });
    expect(wrapper.text()).toContain('Xem chi tiết');
  });
});

describe('PolicyModal Component', () => {
  it('renders trade-in policy details when policyType="trade-in"', async () => {
    const PolicyModal = (await import('../src/components/ui/PolicyModal.vue')).default;
    const wrapper = mount(PolicyModal, {
      props: {
        isOpen: true,
        policyType: 'trade-in'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    });

    expect(wrapper.text()).toContain('Thu Cũ Đổi Mới');
    expect(wrapper.text()).toContain('Trợ Giá Đến 2.000.000₫');
    expect(wrapper.text()).toContain('0988 123 456');
  });

  it('renders delivery policy details when policyType="delivery"', async () => {
    const PolicyModal = (await import('../src/components/ui/PolicyModal.vue')).default;
    const wrapper = mount(PolicyModal, {
      props: {
        isOpen: true,
        policyType: 'delivery'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    });

    expect(wrapper.text()).toContain('Giao Hàng & Lắp Đặt Siêu Tốc');
    expect(wrapper.text()).toContain('Nội Thành Hà Nội Trong 2 Giờ');
  });

  it('emits close event when clicking close button', async () => {
    const PolicyModal = (await import('../src/components/ui/PolicyModal.vue')).default;
    const wrapper = mount(PolicyModal, {
      props: {
        isOpen: true,
        policyType: 'warranty'
      },
      global: {
        stubs: {
          Teleport: true
        }
      }
    });

    const closeBtn = wrapper.find('button[aria-label="Đóng"]');
    await closeBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
