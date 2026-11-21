import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../src/stores/auth';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../src/views/client/HomeView.vue';
import AdminLoginView from '../src/views/auth/AdminLoginView.vue';
import LoginView from '../src/views/client/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/products/:id', component: { template: '<div>Detail</div>' } },
    { path: '/login', component: LoginView },
    { path: '/admin/login', component: AdminLoginView },
    { path: '/admin', component: { template: '<div>Admin</div>' } },
    { path: '/admin/orders', component: { template: '<div>Orders</div>' } }
  ]
});

describe('Tách biệt Cổng Đăng Nhập (Client vs Admin/Staff)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('cho phép khách hàng đăng nhập thành công tại Cổng Khách Hàng (portal: customer)', async () => {
    const authStore = useAuthStore();
    const user = await authStore.login('khachhang@gmail.com', '123456', 'customer');
    expect(user.role).toBe('CUSTOMER');
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.isCustomer).toBe(true);
  });

  it('từ chối Admin và Staff khi cố đăng nhập tại Cổng Khách Hàng (portal: customer)', async () => {
    const authStore = useAuthStore();
    
    // Thử Admin
    await expect(authStore.login('admin@phahang.vn', '123456', 'customer'))
      .rejects.toThrow('Tài khoản Quản trị viên / Nhân viên vui lòng đăng nhập tại Cổng Quản Trị');
    expect(authStore.isAuthenticated).toBe(false);

    // Thử Staff
    await expect(authStore.login('staff@phahang.vn', '123456', 'customer'))
      .rejects.toThrow('Tài khoản Quản trị viên / Nhân viên vui lòng đăng nhập tại Cổng Quản Trị');
    expect(authStore.isAuthenticated).toBe(false);
  });

  it('cho phép Admin và Staff đăng nhập thành công tại Cổng Quản Trị (portal: admin)', async () => {
    const authStore = useAuthStore();
    
    // Admin login
    const admin = await authStore.login('admin@phahang.vn', '123456', 'admin');
    expect(admin.role).toBe('ADMIN');
    expect(authStore.isAdmin).toBe(true);
    authStore.logout();

    // Staff login
    const staff = await authStore.login('staff@phahang.vn', '123456', 'admin');
    expect(staff.role).toBe('STAFF');
    expect(authStore.isStaff).toBe(true);
  });

  it('từ chối Khách hàng khi cố đăng nhập vào Cổng Quản Trị (portal: admin)', async () => {
    const authStore = useAuthStore();
    await expect(authStore.login('khachhang@gmail.com', '123456', 'admin'))
      .rejects.toThrow('Tài khoản khách hàng không có quyền truy cập Cổng Quản Trị');
    expect(authStore.isAuthenticated).toBe(false);
  });

  it('hiển thị đầy đủ giao diện Cổng Quản Trị AdminLoginView với nhãn nhận diện', async () => {
    const wrapper = mount(AdminLoginView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    expect(wrapper.text()).toContain('Cổng Quản Trị Hệ Thống');
    expect(wrapper.text()).toContain('Dành riêng cho Quản trị viên');
    expect(wrapper.text()).toContain('Đăng nhập khách hàng tại đây');
  });
});

describe('Bộ lọc Đa Ngành Hàng Pha Hằng & Mobile Drawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('hiển thị nút mở bộ lọc mobile kèm số lượng active count', async () => {
    router.push('/?category=1');
    await router.isReady();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    const mobileBtn = wrapper.find('.lg\\:hidden button');
    expect(mobileBtn.exists()).toBe(true);
    expect(mobileBtn.text()).toContain('Bộ lọc');
  });

  it('chuyển đổi sang bộ lọc Tủ lạnh khi query category=3', async () => {
    await router.push({ path: '/', query: { category: '3' } });
    await router.isReady();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    expect(wrapper.text()).toContain('Tủ lạnh');
    expect(wrapper.text()).toContain('Thương Hiệu');
    expect(wrapper.text()).toContain('Thông Số Kỹ Thuật');
  });

  it('đảm bảo danh mục Ti vi (category=1) chỉ chứa Ti vi và không chứa Tủ lạnh hay Quạt', async () => {
    await router.push({ path: '/', query: { category: '1' } });
    await router.isReady();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    await new Promise(r => setTimeout(r, 200));
    await wrapper.vm.$nextTick();

    const text = wrapper.text();
    expect(text).toContain('Ti vi');
    expect(text).not.toContain('Quạt đứng');
    expect(text).not.toContain('Nồi cơm');
  });

  it('hỗ trợ tìm kiếm không dấu tiếng Việt (NFR-02.2 / Mục 5.2): tìm "dieu hoa" khớp "Điều hòa"', async () => {
    await router.push({ path: '/', query: { q: 'dieu hoa' } });
    await router.isReady();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    await new Promise(r => setTimeout(r, 250));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Điều hòa');
  });

  it('hỗ trợ tìm kiếm không dấu tiếng Việt: tìm "noi com" khớp "Nồi cơm"', async () => {
    await router.push({ path: '/', query: { q: 'noi com' } });
    await router.isReady();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router, createPinia()]
      }
    });

    await new Promise(r => setTimeout(r, 250));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Nồi cơm');
  });
});
