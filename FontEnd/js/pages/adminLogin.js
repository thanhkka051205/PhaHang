/**
 * Script Đăng Nhập Cổng Quản Trị (admin/login.html)
 * Tái tạo 100% diện mạo và class Tailwind từ AdminLoginView.vue (commit 1a9e3c2)
 */
import { authStore } from '../stores/authStore.js';
import { toast } from '../components/toast.js';

export function initAdminLoginPage() {
  const container = document.getElementById('admin-login-container');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white text-slate-800 rounded-2xl border border-slate-700/50 p-6 sm:p-8 shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-[#DC2626] text-white flex items-center justify-center font-black mx-auto shadow-xs">
          <i data-lucide="shield-check" class="w-7 h-7"></i>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          CỔNG QUẢN TRỊ HỆ THỐNG
        </h1>
        <p class="text-xs text-slate-500">
          Dành riêng cho Ban Giám Đốc và Nhân Viên Showroom Điện Máy Pha Hằng
        </p>
      </div>

      <form id="admin-login-form" class="space-y-4 text-xs">
        <div class="space-y-1.5">
          <label class="block font-bold text-slate-700">Tài khoản Email Showroom:</label>
          <div class="relative">
            <input
              type="email"
              id="admin-email"
              value="admin@phahang.vn"
              placeholder="admin@phahang.vn"
              class="w-full h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden"
              required
            />
            <i data-lucide="mail" class="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"></i>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block font-bold text-slate-700">Mật khẩu:</label>
          <div class="relative">
            <input
              type="password"
              id="admin-password"
              value="admin123"
              placeholder="Nhập mật khẩu..."
              class="w-full h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono"
              required
            />
            <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"></i>
          </div>
        </div>

        <button
          type="submit"
          class="w-full h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm shadow-btn-brand transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <i data-lucide="lock" class="w-4 h-4"></i>
          <span>Xác Thực & Đăng Nhập Quản Trị</span>
        </button>
      </form>

      <!-- Phím tắt nạp nhanh tài khoản -->
      <div class="pt-4 border-t border-slate-100 space-y-2">
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tài khoản phân quyền mẫu:</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            id="btn-fill-admin"
            class="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-left font-semibold cursor-pointer"
          >
            <p class="font-bold text-[#DC2626]">👑 Quản Trị (Admin)</p>
            <p class="text-[10px] text-slate-400 font-mono truncate">admin@phahang.vn</p>
          </button>

          <button
            type="button"
            id="btn-fill-staff"
            class="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-left font-semibold cursor-pointer"
          >
            <p class="font-bold text-emerald-700">🧑‍🔧 Nhân Viên (Staff)</p>
            <p class="text-[10px] text-slate-400 font-mono truncate">nhanvien@phahang.vn</p>
          </button>
        </div>
      </div>

      <div class="pt-2 text-center">
        <a href="/index.html" class="text-xs text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
          <span>Quay lại Cửa Hàng Bán Lẻ</span>
        </a>
      </div>
    </div>
  `;

  bindEvents();
  window.lucide?.createIcons();
}

function bindEvents() {
  const form = document.getElementById('admin-login-form');
  const emailInput = document.getElementById('admin-email');
  const passInput = document.getElementById('admin-password');

  document.getElementById('btn-fill-admin')?.addEventListener('click', () => {
    if (emailInput && passInput) {
      emailInput.value = 'admin@phahang.vn';
      passInput.value = 'admin123';
    }
  });

  document.getElementById('btn-fill-staff')?.addEventListener('click', () => {
    if (emailInput && passInput) {
      emailInput.value = 'nhanvien@phahang.vn';
      passInput.value = 'staff123';
    }
  });

  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const defaultBtnHtml = submitBtn?.innerHTML;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = emailInput?.value?.trim();
      const pass = passInput?.value?.trim();

      if (!email || !pass) {
        toast.error('Vui lòng nhập đầy đủ email và mật khẩu.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Đang xác thực...</span>
        `;
      }

      try {
        const user = await authStore.loginAdmin(email, pass);
        toast.success(`Đăng nhập cổng quản trị thành công (${user.role})!`);
        setTimeout(() => {
          if (user.role === 'ADMIN') {
            window.location.href = '/admin/index.html';
          } else {
            window.location.href = '/admin/orders.html';
          }
        }, 300);
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = defaultBtnHtml;
          window.lucide?.createIcons();
        }
        toast.error(err?.message || 'Email hoặc mật khẩu không chính xác hoặc không có quyền truy cập cổng Quản Trị!');
      }
    };
  }
}

initAdminLoginPage();
