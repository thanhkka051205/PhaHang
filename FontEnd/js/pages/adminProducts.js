/**
 * Script Quản Lý Sản Phẩm (admin/products.html)
 * Tái tạo 100% diện mạo và class Tailwind từ ProductListView.vue (commit 1a9e3c2)
 */
import { mountAdminLayout } from '../components/adminLayout.js';
import { mockService } from '../services/mockService.js';
import { formatVND } from '../core/format.js';
import { esc } from '../core/dom.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';

let products = [];
const categoryNameMap = {
  1: 'Ti vi',
  2: 'Điều hòa',
  3: 'Tủ lạnh',
  4: 'Quạt',
  5: 'Nồi cơm điện'
};

export async function initAdminProductsPage() {
  const allowed = mountAdminLayout('products');
  if (!allowed) return;

  await loadProducts();
}

async function loadProducts() {
  const res = await mockService.getProducts({ limit: 100, includeHidden: true });
  products = res.items || [];
  renderProductsTable();
}

function renderProductsTable() {
  const content = document.getElementById('products-content');
  if (!content) return;

  content.innerHTML = `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <i data-lucide="box" class="w-6 h-6 text-[#DC2626]"></i>
          <span>Quản Lý Sản Phẩm & Thiết Bị Pha Hằng (${products.length})</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Theo dõi danh mục, thương hiệu, thời hạn bảo hành, quản lý seri và trạng thái hiển thị chuẩn Backend PhaHang
        </p>
      </div>

      <button
        type="button"
        id="btn-add-product"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-btn-brand transition-all cursor-pointer"
      >
        <i data-lucide="plus" class="w-4 h-4"></i>
        <span>Thêm Thiết Bị Mới</span>
      </button>
    </div>

    <!-- Bảng danh sách sản phẩm -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              <th class="p-3.5">Ảnh</th>
              <th class="p-3.5">Tên Thiết Bị & Hãng</th>
              <th class="p-3.5">Ngành Hàng</th>
              <th class="p-3.5 text-right">Giá Bán Thấp Nhất</th>
              <th class="p-3.5 text-center">Tồn Kho</th>
              <th class="p-3.5 text-center">Bảo Hành</th>
              <th class="p-3.5 text-center">Quản Lý Seri</th>
              <th class="p-3.5 text-center">Trạng Thái</th>
              <th class="p-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${products.map(p => {
              const lowestPrice = p.variants && p.variants.length > 0
                ? Math.min(...p.variants.map(v => v.price))
                : (p.price || 0);
              const totalStock = p.variants
                ? p.variants.reduce((s, v) => s + (v.stockQty || 0), 0)
                : 10;

              return `
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5">
                    <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      <img src="${esc(p.images?.[0] || '')}" alt="${esc(p.name)}" class="max-w-full max-h-full object-contain" />
                    </div>
                  </td>
                  <td class="p-3.5">
                    <p class="font-bold text-slate-900 leading-tight">${esc(p.name)}</p>
                    <span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      ${esc(p.brand)}
                    </span>
                  </td>
                  <td class="p-3.5 font-semibold text-slate-700">
                    ${categoryNameMap[p.categoryId] || 'Khác'}
                  </td>
                  <td class="p-3.5 text-right font-mono font-bold text-[#DC2626]">
                    ${lowestPrice > 0 ? formatVND(lowestPrice) : 'Liên hệ'}
                  </td>
                  <td class="p-3.5 text-center font-mono">
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold ${totalStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}">
                      ${totalStock}
                    </span>
                  </td>
                  <td class="p-3.5 text-center font-semibold text-slate-600">
                    ${p.warrantyMonths || 0} Tháng
                  </td>
                  <td class="p-3.5 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.trackSerial ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500'}">
                      ${p.trackSerial ? 'Có Seri' : 'Không'}
                    </span>
                  </td>
                  <td class="p-3.5 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.isVisible !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
                      ${p.isVisible !== false ? 'Hiển thị' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td class="p-3.5 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        class="btn-edit-product p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        data-id="${p.id}"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                      </button>
                      <button
                        type="button"
                        class="btn-delete-product p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        data-id="${p.id}"
                        data-name="${esc(p.name)}"
                        title="Xóa sản phẩm"
                      >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindProductEvents();
  window.lucide?.createIcons();
}

function bindProductEvents() {
  document.getElementById('btn-add-product')?.addEventListener('click', () => {
    openProductModal();
  });

  document.querySelectorAll('.btn-edit-product').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const prod = products.find(p => p.id === id);
      if (prod) openProductModal(prod);
    };
  });

  document.querySelectorAll('.btn-delete-product').forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);
      const name = btn.dataset.name;
      const ok = await confirmDialog({
        title: 'Xóa sản phẩm khỏi hệ thống',
        message: `Bạn có chắc chắn muốn xóa sản phẩm "${name}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xác nhận xóa',
        cancelText: 'Giữ lại',
        danger: true
      });
      if (ok) {
        await mockService.deleteProduct(id);
        toast.info(`Đã xóa sản phẩm "${name}"`);
        loadProducts();
      }
    };
  });
}

function openProductModal(editing = null) {
  const isEdit = Boolean(editing);

  const modal = openModal({
    title: isEdit ? `Chỉnh Sửa Sản Phẩm #${editing.id}` : 'Thêm Thiết Bị Điện Máy Mới',
    bodyHtml: `
      <form id="product-form-modal" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Tên thiết bị điện máy <span class="text-[#DC2626]">*</span>:</label>
          <input
            type="text"
            id="p-name"
            value="${esc(editing?.name || '')}"
            placeholder="Ví dụ: Smart Tivi OLED Sony 4K 55 inch"
            class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Ngành hàng:</label>
            <select id="p-category" class="w-full h-10 px-3 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden">
              <option value="1" ${editing?.categoryId === 1 ? 'selected' : ''}>Ti vi</option>
              <option value="2" ${editing?.categoryId === 2 ? 'selected' : ''}>Điều hòa</option>
              <option value="3" ${editing?.categoryId === 3 ? 'selected' : ''}>Tủ lạnh</option>
              <option value="4" ${editing?.categoryId === 4 ? 'selected' : ''}>Quạt</option>
              <option value="5" ${editing?.categoryId === 5 ? 'selected' : ''}>Nồi cơm điện</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Thương hiệu:</label>
            <input
              type="text"
              id="p-brand"
              value="${esc(editing?.brand || 'Sony')}"
              class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Bảo hành (tháng):</label>
            <input
              type="number"
              id="p-warranty"
              value="${editing?.warrantyMonths ?? 24}"
              min="0"
              class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Giá bán (VND):</label>
            <input
              type="number"
              id="p-price"
              value="${editing?.variants?.[0]?.price || 15000000}"
              class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono"
              required
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tồn kho:</label>
            <input
              type="number"
              id="p-stock"
              value="${editing?.variants?.[0]?.stockQty || 10}"
              class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono"
              required
            />
          </div>
        </div>

        <!-- Cấu hình chuẩn Backend PhaHang: Quản lý Seri & Trạng thái hiển thị -->
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="p-track-serial"
              ${editing?.trackSerial ? 'checked' : ''}
              class="w-4 h-4 rounded text-[#DC2626] focus:ring-[#DC2626]"
            />
            <span class="font-bold text-slate-700">Quản lý theo Số Seri chính hãng (trackSerial)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="p-visible"
              ${editing?.isVisible !== false ? 'checked' : ''}
              class="w-4 h-4 rounded text-[#DC2626] focus:ring-[#DC2626]"
            />
            <span class="font-bold text-slate-700">Hiển thị sản phẩm trên website (isVisible)</span>
          </label>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Mô tả sản phẩm chi tiết (Backend PhaHang):</label>
          <textarea
            id="p-desc"
            rows="2"
            class="w-full p-3 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden"
          >${esc(editing?.description || '')}</textarea>
        </div>
      </form>
    `,
    footerHtml: `
      <button type="button" id="btn-save-prod" class="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
        ${isEdit ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
      </button>
    `,
    maxWidth: '540px'
  });

  const saveBtn = modal.element.querySelector('#btn-save-prod');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const name = modal.element.querySelector('#p-name')?.value?.trim();
      const catId = Number(modal.element.querySelector('#p-category')?.value) || 1;
      const brand = modal.element.querySelector('#p-brand')?.value?.trim();
      const warrantyMonths = Number(modal.element.querySelector('#p-warranty')?.value) || 0;
      const trackSerial = modal.element.querySelector('#p-track-serial')?.checked || false;
      const isVisible = modal.element.querySelector('#p-visible')?.checked !== false;
      const price = Number(modal.element.querySelector('#p-price')?.value) || 0;
      const stock = Number(modal.element.querySelector('#p-stock')?.value) || 0;
      const desc = modal.element.querySelector('#p-desc')?.value?.trim();

      if (!name) {
        toast.warning('Tên sản phẩm không được để trống!');
        return;
      }

      if (isEdit) {
        await mockService.updateProduct(editing.id, {
          name,
          categoryId: catId,
          brand,
          warrantyMonths,
          trackSerial,
          isVisible,
          description: desc,
          variants: [
            {
              id: editing.variants?.[0]?.id || Date.now(),
              spec: editing.variants?.[0]?.spec || 'Tiêu chuẩn',
              color: editing.variants?.[0]?.color || 'Tiêu chuẩn',
              price,
              stockQty: stock
            }
          ]
        });
        toast.success(`Đã cập nhật sản phẩm "${name}"`);
      } else {
        await mockService.createProduct({
          name,
          categoryId: catId,
          brand,
          warrantyMonths,
          trackSerial,
          isVisible,
          description: desc,
          images: ['https://storage.googleapis.com/teko-gae.appspot.com/media/image/2024/9/6/7c2a0825-271d-44ea-ab30-f8ac235548c5/image.png'],
          variants: [
            {
              id: Date.now(),
              spec: 'Tiêu chuẩn',
              color: 'Tiêu chuẩn',
              price,
              stockQty: stock
            }
          ]
        });
        toast.success(`Đã thêm thiết bị "${name}" thành công!`);
      }

      modal.close();
      loadProducts();
    };
  }
}

initAdminProductsPage();
