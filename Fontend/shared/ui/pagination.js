/**
 * BasePagination Component (UI-10: 12 sản phẩm/trang, có Trước, Sau, số trang)
 */
import { esc } from '../core/dom.js';

export function renderPagination({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) {
  if (totalPages <= 1) return '';

  let html = `<nav class="pagination" aria-label="Phân trang sản phẩm">`;

  // Nút Trước
  html += `
    <button class="page-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" aria-label="Trang trước">
      ‹ Trước
    </button>
  `;

  // Các trang số
  for (let i = 1; i <= totalPages; i++) {
    // Nếu quá nhiều trang, rút gọn
    if (totalPages > 7) {
      if (i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
        if (i === 3 || i === totalPages - 2) {
          html += `<span style="padding: 0 4px; color: var(--c-text-subtle);">...</span>`;
        }
        continue;
      }
    }

    const isActive = i === currentPage;
    html += `
      <button class="page-btn ${isActive ? 'active' : ''}" data-page="${i}" aria-current="${isActive ? 'page' : 'false'}">
        ${i}
      </button>
    `;
  }

  // Nút Sau
  html += `
    <button class="page-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}" aria-label="Trang sau">
      Sau ›
    </button>
  `;

  html += `</nav>`;
  return html;
}

export function bindPaginationEvents(container, onPageChange) {
  if (!container) return;
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.page-btn');
    if (btn && !btn.disabled) {
      const page = Number(btn.getAttribute('data-page'));
      if (page && onPageChange) {
        onPageChange(page);
      }
    }
  });
}
