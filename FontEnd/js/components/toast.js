/**
 * BaseToast Component (UI-07)
 * Chuẩn Tailwind CSS từ commit 1a9e3c2
 */
import { esc } from '../core/dom.js';

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed bottom-5 right-5 z-[70] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast({ type = 'info', title = '', message = '', duration = 3500 }) {
  if (typeof document === 'undefined') return;
  const container = ensureContainer();

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-[#DC2626]',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-slate-900 border-slate-800 text-white'
  };

  const iconName = {
    success: 'check-circle-2',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info'
  }[type] || 'info';

  toast.className = `pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl transition-all duration-300 text-xs font-semibold ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 shrink-0 mt-0.5"></i>
    <div class="flex-1 min-w-0">
      ${title ? `<div class="font-bold text-sm tracking-tight mb-0.5">${esc(title)}</div>` : ''}
      <div class="leading-relaxed opacity-90">${esc(message)}</div>
    </div>
    <button type="button" class="toast-close p-1 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity shrink-0 cursor-pointer" aria-label="Đóng">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  };

  closeBtn.addEventListener('click', removeToast);

  container.appendChild(toast);
  window.lucide?.createIcons();

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

export const toast = {
  success: (message, title = 'Thành công') => showToast({ type: 'success', title, message }),
  error: (message, title = 'Lỗi') => showToast({ type: 'error', title, message }),
  warning: (message, title = 'Cảnh báo') => showToast({ type: 'warning', title, message }),
  info: (message, title = 'Thông báo') => showToast({ type: 'info', title, message })
};
