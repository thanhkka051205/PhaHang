/**
 * Script Đăng Nhập & Đăng Ký Khách Hàng (login.html, register.html)
 * Tuân thủ UI-05 (Bắt buộc dấu *, lỗi tiếng Việt nội dòng ngay dưới ô nhập)
 * Xử lý chính xác async/await và lưu trữ tài khoản vào LocalStorage
 */
import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { authStore } from '../stores/authStore.js';
import { toast } from '../components/toast.js';
import { showFieldError, clearFieldError, validateEmail, validatePhone } from '../core/validate.js';
import { esc } from '../core/dom.js';

export function initAuthPage() {
  mountHeader();
  mountFooter();

  const container = document.getElementById('auth-container');
  if (!container) return;

  const isRegister = window.location.pathname.includes('register');

  if (!isRegister) {
    // FORM ĐĂNG NHẬP
    container.innerHTML = `
      <div class="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center font-black mx-auto shadow-xs">
            <i data-lucide="tv" class="w-6 h-6"></i>
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Đăng Nhập Khách Hàng
          </h1>
          <p class="text-xs text-slate-500">
            Đăng nhập để theo dõi trạng thái đơn hàng và hồ sơ bảo hành điện tử
          </p>
        </div>

        <form id="login-form" class="space-y-4 text-xs" novalidate>
          <div class="space-y-1.5">
            <label class="block font-bold text-slate-700">Địa chỉ Email <span class="text-[#DC2626]">*</span>:</label>
            <div class="relative">
              <input
                type="email"
                id="login-email"
                value="khachhang@gmail.com"
                placeholder="email@example.com"
                class="w-full h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden"
                required
              />
              <i data-lucide="mail" class="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"></i>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block font-bold text-slate-700">Mật khẩu <span class="text-[#DC2626]">*</span>:</label>
            <div class="relative">
              <input
                type="password"
                id="login-password"
                value="123456"
                placeholder="Nhập mật khẩu..."
                class="w-full h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono"
                required
              />
              <i data-lucide="lock" class="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"></i>
            </div>
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            class="w-full h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm shadow-btn-brand transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <i data-lucide="log-in" class="w-4 h-4"></i>
            <span>Đăng Nhập Ngay</span>
          </button>
        </form>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Chưa có tài khoản?</span>
          <a href="/register.html" class="font-bold text-[#DC2626] hover:underline">
            Đăng ký tài khoản mới →
          </a>
        </div>

        <!-- Mẹo tài khoản thử nghiệm -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1 font-medium">
          <p class="font-bold text-slate-800">Tài khoản khách hàng thử nghiệm:</p>
          <p class="font-mono">Email: <strong>khachhang@gmail.com</strong> | Pass: <strong>123456</strong></p>
          <div class="pt-1 border-t border-slate-200 text-[10px] text-slate-400">
            Nếu bạn là Quản trị viên hoặc Nhân viên Showroom: <a href="/admin/login.html" class="text-[#DC2626] font-bold hover:underline">Vào Cổng Admin riêng</a>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('btn-login-submit');

    [emailInput, passInput].forEach(inp => {
      inp?.addEventListener('input', () => clearFieldError(inp));
    });

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        clearFieldError(emailInput);
        clearFieldError(passInput);

        const email = emailInput?.value?.trim();
        const password = passInput?.value?.trim();

        let hasError = false;
        if (!email) {
          showFieldError(emailInput, 'Vui lòng nhập địa chỉ email.');
          hasError = true;
        } else if (!validateEmail(email)) {
          showFieldError(emailInput, 'Địa chỉ email không đúng định dạng (VD: example@gmail.com).');
          hasError = true;
        }

        if (!password) {
          showFieldError(passInput, 'Vui lòng nhập mật khẩu.');
          hasError = true;
        }

        if (hasError) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Đang xác thực...</span>
        `;

        try {
          const user = await authStore.loginClient(email, password);
          toast.success(`Chào mừng ${user.fullName} đã quay trở lại!`);
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 350);
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <i data-lucide="log-in" class="w-4 h-4"></i>
            <span>Đăng Nhập Ngay</span>
          `;
          window.lucide?.createIcons();
          showFieldError(passInput, err.message || 'Email hoặc mật khẩu không chính xác.');
          toast.error(err.message || 'Đăng nhập không thành công.');
        }
      };
    }
  } else {
    // FORM ĐĂNG KÝ
    container.innerHTML = `
      <div class="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center font-black mx-auto shadow-xs">
            <i data-lucide="user-plus" class="w-6 h-6"></i>
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Đăng Ký Tài Khoản Mới
          </h1>
          <p class="text-xs text-slate-500">
            Trở thành thành viên Pha Hằng để nhận voucher 50K và tích điểm bảo hành
          </p>
        </div>

        <form id="register-form" class="space-y-3.5 text-xs" novalidate>
          <div class="space-y-1">
            <label class="block font-bold text-slate-700">Họ và tên <span class="text-[#DC2626]">*</span>:</label>
            <input
              type="text"
              id="reg-name"
              placeholder="Ví dụ: Trần Văn Nam"
              class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden"
              required
            />
          </div>

          <div class="space-y-1">
            <label class="block font-bold text-slate-700">Địa chỉ Email <span class="text-[#DC2626]">*</span>:</label>
            <input
              type="email"
              id="reg-email"
              placeholder="example@gmail.com"
              class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden"
              required
            />
          </div>

          <div class="space-y-1">
            <label class="block font-bold text-slate-700">Số điện thoại <span class="text-[#DC2626]">*</span>:</label>
            <input
              type="tel"
              id="reg-phone"
              placeholder="Ví dụ: 0988123456"
              class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono"
              required
            />
          </div>

          <div class="space-y-1">
            <label class="block font-bold text-slate-700">Mật khẩu (Tối thiểu 8 ký tự - FR-01.4) <span class="text-[#DC2626]">*</span>:</label>
            <input
              type="password"
              id="reg-password"
              placeholder="Tối thiểu 8 ký tự..."
              class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono"
              required
            />
          </div>

          <!-- Checkbox Nghị định 13/2023/NĐ-CP (FR-01.4) -->
          <div class="pt-1">
            <label class="flex items-start gap-2.5 cursor-pointer text-slate-600 text-[11px] leading-relaxed">
              <input type="checkbox" id="reg-consent" class="mt-0.5 rounded text-[#DC2626] focus:ring-[#DC2626]" required />
              <span>
                Tôi đồng ý cho phép <strong>Cửa hàng Điện Máy Pha Hằng</strong> thu thập và xử lý dữ liệu cá nhân theo quy định tại <strong>Nghị định số 13/2023/NĐ-CP</strong> để phục vụ giao hàng và kích hoạt bảo hành điện tử.
              </span>
            </label>
            <p id="consent-error" class="hidden text-rose-600 text-[11px] mt-1 font-semibold">⚠️ Vui lòng tích đồng ý điều khoản xử lý dữ liệu.</p>
          </div>

          <button
            type="submit"
            id="btn-register-submit"
            class="w-full h-11 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm shadow-btn-brand transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Hoàn Tất Đăng Ký</span>
          </button>
        </form>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Đã có tài khoản?</span>
          <a href="/login.html" class="font-bold text-[#DC2626] hover:underline">
            Đăng nhập ngay →
          </a>
        </div>
      </div>
    `;

    const form = document.getElementById('register-form');
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    const passInput = document.getElementById('reg-password');
    const consentInput = document.getElementById('reg-consent');
    const consentErr = document.getElementById('consent-error');
    const submitBtn = document.getElementById('btn-register-submit');

    [nameInput, emailInput, phoneInput, passInput].forEach(inp => {
      inp?.addEventListener('input', () => clearFieldError(inp));
    });
    consentInput?.addEventListener('change', () => consentErr?.classList.add('hidden'));

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        [nameInput, emailInput, phoneInput, passInput].forEach(inp => clearFieldError(inp));
        consentErr?.classList.add('hidden');

        const name = nameInput?.value?.trim();
        const email = emailInput?.value?.trim();
        const phone = phoneInput?.value?.trim();
        const password = passInput?.value?.trim();
        const consent = consentInput?.checked;

        let hasError = false;

        if (!name) {
          showFieldError(nameInput, 'Vui lòng nhập họ và tên của bạn.');
          hasError = true;
        }

        if (!email) {
          showFieldError(emailInput, 'Vui lòng nhập địa chỉ email.');
          hasError = true;
        } else if (!validateEmail(email)) {
          showFieldError(emailInput, 'Địa chỉ email không đúng định dạng.');
          hasError = true;
        }

        if (!phone) {
          showFieldError(phoneInput, 'Vui lòng nhập số điện thoại.');
          hasError = true;
        } else if (!validatePhone(phone)) {
          showFieldError(phoneInput, 'Số điện thoại không hợp lệ (cần đúng 10 số, đầu số VN).');
          hasError = true;
        }

        if (!password) {
          showFieldError(passInput, 'Vui lòng đặt mật khẩu.');
          hasError = true;
        } else if (password.length < 8) {
          showFieldError(passInput, 'Mật khẩu bắt buộc phải có tối thiểu 8 ký tự (FR-01.4).');
          hasError = true;
        }

        if (!consent) {
          consentErr?.classList.remove('hidden');
          hasError = true;
        }

        if (hasError) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tạo tài khoản...</span>
        `;

        try {
          const user = await authStore.registerClient({
            fullName: name,
            email,
            phone,
            password,
            agreedPrivacyPolicy: consent
          });
          toast.success(`Đăng ký thành công! Chào mừng ${user.fullName}`);
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 400);
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Hoàn Tất Đăng Ký</span>
          `;
          window.lucide?.createIcons();

          const msg = err?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
          const lowerMsg = msg.toLowerCase();

          if (lowerMsg.includes('email')) {
            showFieldError(emailInput, msg);
            toast.error(msg);
          } else if (lowerMsg.includes('điện thoại') || lowerMsg.includes('phone') || lowerMsg.includes('sđt')) {
            showFieldError(phoneInput, msg);
            toast.error(msg);
          } else if (lowerMsg.includes('mật khẩu') || lowerMsg.includes('password')) {
            showFieldError(passInput, msg);
            toast.error(msg);
          } else {
            toast.error(msg);
          }
        }
      };
    }
  }

  window.lucide?.createIcons();
}

initAuthPage();
