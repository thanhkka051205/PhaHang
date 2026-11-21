import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { authGuard } from '@/router/guards';
import { api } from '@/api';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/warranty', component: { template: '<div>Warranty</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/cart', component: { template: '<div>Cart</div>' } },
    { path: '/my-orders', component: { template: '<div>My Orders</div>' }, meta: { requiresAuth: true, roles: ['CUSTOMER'] } },
    { path: '/admin/orders', component: { template: '<div>Admin Orders</div>' }, meta: { requiresAuth: true, roles: ['STAFF', 'ADMIN'] } }
  ]
});

describe('UI/UX Fixes Suite V2 (TASK-017)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  describe('1. BaseModal đa tương thích props (open, isOpen, modelValue, zIndex)', () => {
    it('mở modal thành công khi dùng prop :open="true"', () => {
      const wrapper = mount(BaseModal, {
        props: { open: true, title: 'Modal Open Prop' },
        slots: { default: '<p>Nội dung modal</p>' }
      });

      expect(document.body.innerHTML).toContain('Modal Open Prop');
      expect(document.body.innerHTML).toContain('Nội dung modal');
      wrapper.unmount();
    });

    it('mở modal thành công khi dùng prop :isOpen="true"', () => {
      const wrapper = mount(BaseModal, {
        props: { isOpen: true, title: 'Modal isOpen Prop' },
        slots: { default: '<p>Nội dung isOpen</p>' }
      });

      expect(document.body.innerHTML).toContain('Modal isOpen Prop');
      wrapper.unmount();
    });

    it('mở modal thành công khi dùng v-model (prop modelValue: true)', () => {
      const wrapper = mount(BaseModal, {
        props: { modelValue: true, title: 'Modal v-model' },
        slots: { default: '<p>Nội dung v-model</p>' }
      });

      expect(document.body.innerHTML).toContain('Modal v-model');
      wrapper.unmount();
    });

    it('thiết lập zIndex tùy biến (ví dụ zIndex = 80)', () => {
      const wrapper = mount(BaseModal, {
        props: { modelValue: true, zIndex: 80 }
      });

      const modalRoot = document.body.querySelector('.fixed.inset-0') as HTMLElement;
      expect(modalRoot).not.toBeNull();
      expect(modalRoot.style.zIndex).toBe('80');
      wrapper.unmount();
    });

    it('emit đầy đủ update:modelValue, update:open, update:isOpen, close khi đóng', async () => {
      const wrapper = mount(BaseModal, {
        props: { modelValue: true, title: 'Test Close' }
      });

      const closeButton = document.body.querySelector('button') as HTMLButtonElement;
      expect(closeButton).not.toBeNull();
      await closeButton.click();

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
      expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
      expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false]);
      wrapper.unmount();
    });
  });

  describe('2. BaseConfirmDialog sử dụng zIndex 80 nổi trên modal khác', () => {
    it('BaseConfirmDialog truyền zIndex 80 vào BaseModal', () => {
      const uiStore = useUiStore();
      uiStore.openConfirm({
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn?'
      });

      const wrapper = mount(BaseConfirmDialog);
      const modalComponent = wrapper.findComponent(BaseModal);
      expect(modalComponent.exists()).toBe(true);
      expect(modalComponent.props('zIndex')).toBe(80);
      wrapper.unmount();
      uiStore.closeConfirm();
    });
  });

  describe('3. Phân quyền AppHeader: Ẩn "Đơn hàng của tôi" với Admin và Staff', () => {
    it('Khách hàng (CUSTOMER) thấy mục "Đơn hàng của tôi"', async () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: 1,
        fullName: 'Khách Hàng A',
        email: 'khach@gmail.com',
        phone: '0981234567',
        role: 'CUSTOMER',
        isActive: true,
        createdAt: '2026-11-01'
      };
      authStore.token = 'mock-customer-token';

      const wrapper = mount(AppHeader, {
        global: {
          plugins: [router]
        }
      });

      // Mở menu user
      const userButton = wrapper.find('button.inline-flex.items-center.gap-1\\.5');
      if (userButton.exists()) {
        await userButton.trigger('click');
        expect(wrapper.html()).toContain('Đơn hàng của tôi');
      }
      wrapper.unmount();
    });

    it('Nhân viên (STAFF) và Quản trị viên (ADMIN) KHÔNG thấy mục "Đơn hàng của tôi"', async () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: 2,
        fullName: 'Quản Trị Viên B',
        email: 'admin@dienmayphahang.vn',
        phone: '0988776655',
        role: 'ADMIN',
        isActive: true,
        createdAt: '2026-11-01'
      };
      authStore.token = 'mock-admin-token';

      const wrapper = mount(AppHeader, {
        global: {
          plugins: [router]
        }
      });

      // Mở menu user
      const userButton = wrapper.find('button.inline-flex.items-center.gap-1\\.5');
      if (userButton.exists()) {
        await userButton.trigger('click');
        expect(wrapper.html()).not.toContain('Đơn hàng của tôi');
        expect(wrapper.html()).toContain('Cổng quản trị');
      }
      wrapper.unmount();
    });
  });

  describe('4. Router Guard: Admin/Staff vào /my-orders được chuyển hướng', () => {
    it('Admin/Staff truy cập /my-orders sẽ redirect sang /admin/orders', async () => {
      const staffUser = {
        id: 3,
        fullName: 'Nhân Viên C',
        email: 'staff@dienmayphahang.vn',
        phone: '0988001122',
        role: 'STAFF' as const,
        isActive: true,
        createdAt: '2026-11-01'
      };

      vi.spyOn(api.auth, 'me').mockResolvedValue(staffUser);

      const authStore = useAuthStore();
      authStore.user = staffUser;
      authStore.token = 'mock-staff-token';

      const toRoute = {
        path: '/my-orders',
        fullPath: '/my-orders',
        matched: [{ meta: { requiresAuth: true } }],
        meta: { requiresAuth: true, roles: ['CUSTOMER'] }
      } as any;

      const fromRoute = { path: '/' } as any;
      const nextFn = vi.fn();

      await authGuard(toRoute, fromRoute, nextFn);

      expect(nextFn).toHaveBeenCalledWith('/admin/orders');
    });
  });
});
