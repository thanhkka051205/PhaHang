/**
 * BaseModal & BaseConfirmDialog (UI-06)
 * Chuẩn phong cách Tailwind CSS từ commit 1a9e3c2
 */
import { esc } from '../core/dom.js';

let activeBackdrop = null;

export function openModal({ title = '', bodyHtml = '', footerHtml = '', maxWidth = '540px', onClose = null }) {
  closeModal();

  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none';
  backdrop.innerHTML = `
    <div class="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all max-h-[90vh]" style="max-width: ${maxWidth};">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 truncate">${esc(title)}</h3>
        <button type="button" class="modal-close-btn p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer" aria-label="Đóng">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
      <div class="p-5 overflow-y-auto text-xs sm:text-sm text-slate-700">
        ${bodyHtml}
      </div>
      ${footerHtml ? `
        <div class="flex items-center justify-end gap-2.5 px-5 py-3 bg-slate-50/80 border-t border-slate-100">
          ${footerHtml}
        </div>
      ` : ''}
    </div>
  `;

  const closeBtn = backdrop.querySelector('.modal-close-btn');
  const doClose = () => {
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      if (activeBackdrop === backdrop) activeBackdrop = null;
      if (onClose) onClose();
    }, 120);
  };

  closeBtn.addEventListener('click', doClose);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) doClose();
  });

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      doClose();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);

  document.body.appendChild(backdrop);
  activeBackdrop = backdrop;
  window.lucide?.createIcons();

  return {
    element: backdrop,
    close: doClose
  };
}

export function closeModal() {
  if (activeBackdrop && activeBackdrop.parentNode) {
    activeBackdrop.parentNode.removeChild(activeBackdrop);
    activeBackdrop = null;
  }
}

/**
 * Hộp thoại xác nhận thao tác không thể hoàn tác (UI-06)
 * Trả về Promise<boolean>
 */
export function confirmDialog({
  title = 'Xác nhận thao tác',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này không?',
  confirmText = 'Đồng ý',
  cancelText = 'Hủy bỏ',
  danger = false
}) {
  return new Promise((resolve) => {
    const footerHtml = `
      <button type="button" class="modal-cancel-btn px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer">${esc(cancelText)}</button>
      <button type="button" class="modal-confirm-btn px-4 py-2 rounded-xl font-bold text-xs text-white shadow-xs transition-all cursor-pointer ${danger ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : 'bg-[#0F172A] hover:bg-slate-800'}">${esc(confirmText)}</button>
    `;

    const bodyHtml = `<p class="leading-relaxed text-slate-700 text-xs sm:text-sm">${esc(message)}</p>`;

    const modal = openModal({
      title,
      bodyHtml,
      footerHtml,
      maxWidth: '440px',
      onClose: () => resolve(false)
    });

    const confirmBtn = modal.element.querySelector('.modal-confirm-btn');
    const cancelBtn = modal.element.querySelector('.modal-cancel-btn');

    confirmBtn.addEventListener('click', () => {
      modal.close();
      resolve(true);
    });

    cancelBtn.addEventListener('click', () => {
      modal.close();
      resolve(false);
    });
  });
}
