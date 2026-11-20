/**
 * Module xác thực Form và thông báo lỗi nội dòng chuẩn UI-05
 * Bắt buộc dấu * ở ô nhập bắt buộc; hiển thị lỗi tiếng Việt ngay dưới ô nhập.
 */
import { toast } from '../components/toast.js';

export function showFieldError(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add('border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-100');
  inputEl.setAttribute('aria-invalid', 'true');

  let errorEl = inputEl.parentElement.querySelector('.field-error');
  if (!errorEl && inputEl.parentElement) {
    errorEl = document.createElement('p');
    errorEl.className = 'field-error text-rose-600 text-[11px] mt-1 font-semibold flex items-center gap-1 animate-in fade-in duration-150';
    errorEl.setAttribute('role', 'alert');
    inputEl.parentElement.appendChild(errorEl);
  }
  if (errorEl) {
    errorEl.innerHTML = `<span class="inline-block">⚠️</span> <span>${message}</span>`;
  }
}

export function clearFieldError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove('border-rose-500', 'focus:border-rose-500', 'focus:ring-rose-100');
  inputEl.removeAttribute('aria-invalid');
  const errorEl = inputEl.parentElement?.querySelector('.field-error');
  if (errorEl) {
    errorEl.remove();
  }
}

export function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/[\s.-]/g, '');
  return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(clean);
}

/**
 * Tiện ích 1-Click sao chép nội dung vào Clipboard (hỗ trợ cả mobile lẫn desktop)
 */
export async function copyToClipboard(text, successMsg = 'Đã sao chép vào bộ nhớ tạm!') {
  if (!text) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    toast.success(successMsg);
  } catch (err) {
    toast.info(`Vui lòng sao chép thủ công: ${text}`);
  }
}
