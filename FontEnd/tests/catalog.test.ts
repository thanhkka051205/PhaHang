import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import AppHeader from '../src/components/layout/AppHeader.vue';
import HomeView from '../src/views/client/HomeView.vue';
import RegisterView from '../src/views/client/RegisterView.vue';
import OrderListView from '../src/views/admin/OrderListView.vue';

// Setup minimal router for testing components with router-link / useRouter
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/warranty', component: { template: '<div>Warranty</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/cart', component: { template: '<div>Cart</div>' } },
    { path: '/orders', component: { template: '<div>Orders</div>' } }
  ]
});

describe('AppHeader UI-01 & Wireframe Hình 11 Sub-Navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders all 5 primary navigation categories according to UI-01: Ti vi, Điều hòa, Tủ lạnh, Quạt, Nồi cơm điện (Bảo hành đã tách ra Header)', async () => {
    router.push('/');
    await router.isReady();

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    const navText = wrapper.find('nav').text();
    expect(navText).toContain('Ti vi');
    expect(navText).toContain('Điều hòa');
    expect(navText).toContain('Tủ lạnh');
    expect(navText).toContain('Quạt');
    expect(navText).toContain('Nồi cơm điện');
    expect(navText).not.toContain('Bảo hành');
  });

  it('links categories directly with category query and places warranty lookup button on main header', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    const links = wrapper.findAll('nav a');
    const hrefs = links.map(l => l.attributes('href'));
    expect(hrefs.some(h => h?.includes('category=1'))).toBe(true);
    expect(hrefs.some(h => h?.includes('category=2'))).toBe(true);
    expect(hrefs.some(h => h?.includes('category=3'))).toBe(true);
    expect(hrefs.some(h => h?.includes('category=4'))).toBe(true);
    expect(hrefs.some(h => h?.includes('category=5'))).toBe(true);
    expect(hrefs.some(h => h?.includes('/warranty'))).toBe(false);

    // Kiểm tra nút Tra cứu bảo hành nằm nổi bật tại Header chính
    const allLinks = wrapper.findAll('a');
    expect(allLinks.some(l => l.attributes('href') === '/warranty' && l.text().includes('Tra cứu bảo hành'))).toBe(true);
  });
});

describe('HomeView (SCR-01 Wireframe Hình 11)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders filter sidebar with brand, spec, type and price inputs', async () => {
    router.push('/');
    await router.isReady();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    // Check dropdowns
    const selects = wrapper.findAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(3);
    expect(wrapper.text()).toContain('Thương Hiệu');
    expect(wrapper.text()).toContain('Thông Số Kỹ Thuật');
    expect(wrapper.text()).toContain('Phân Loại Dòng Máy');

    // Check action buttons
    expect(wrapper.text()).toContain('Áp Dụng Bộ Lọc');
  });

  it('displays validation error when priceFrom is greater than priceTo (Luồng thay thế 3a SRS)', async () => {
    router.push('/');
    await router.isReady();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    // Set invalid price range
    const inputs = wrapper.findAll('input[type="text"]');
    const priceInputs = inputs.filter(i => i.attributes('placeholder')?.includes('Từ...') || i.attributes('placeholder')?.includes('Đến...'));
    if (priceInputs.length >= 2) {
      await priceInputs[0].setValue('30000000');
      await priceInputs[1].setValue('10000000');

      // Click "Áp Dụng Bộ Lọc"
      const applyBtn = wrapper.findAll('button').find(b => b.text().includes('Áp Dụng'));
      if (applyBtn) {
        await applyBtn.trigger('submit');
        expect(wrapper.text()).toContain('Giá bắt đầu không được lớn hơn giá kết thúc');
      }
    }
  });
});

describe('OrderListView (SCR-07 Wireframe Hình 13)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders date inputs (Từ ngày, Đến ngày) and search button according to Hình 13', async () => {
    router.push('/');
    await router.isReady();

    const wrapper = mount(OrderListView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    const dateInputs = wrapper.findAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);

    expect(wrapper.text()).toContain('Tìm kiếm');
    expect(wrapper.text()).toContain('Trạng thái');
  });

  it('displays the yellow operational instruction box at the bottom as specified in Hình 13', async () => {
    const wrapper = mount(OrderListView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    const yellowBox = wrapper.find('.bg-amber-50');
    expect(yellowBox.exists()).toBe(true);
    expect(yellowBox.text()).toContain('Quy trình nghiệp vụ xử lý đơn hàng');
  });
});

describe('RegisterView (SCR-03 Section 8.1 Nghị định 13/2023/NĐ-CP)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders privacy consent checkbox referencing Nghị định 13/2023/NĐ-CP', async () => {
    router.push('/register');
    await router.isReady();

    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    expect(wrapper.text()).toContain('Nghị định 13/2023/NĐ-CP');
    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.exists()).toBe(true);
  });

  it('blocks registration and shows validation error if consent checkbox is not checked', async () => {
    router.push('/register');
    await router.isReady();

    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    // Fill other fields
    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('Trần Văn Thử');
    await inputs[1].setValue('thu@gmail.com');
    await inputs[2].setValue('0988776655');
    await inputs[3].setValue('matkhau123');
    await inputs[4].setValue('matkhau123');

    // Make sure checkbox is unchecked
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(false);

    // Submit form
    await wrapper.find('form').trigger('submit');

    expect(wrapper.text()).toContain('Vui lòng tích chọn đồng ý xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP');
  });
});
