/**
 * Script Quản Lý Đơn Hàng (admin/orders.html)
 * Tái tạo 100% diện mạo và class Tailwind từ OrderListView.vue (commit 1a9e3c2)
 * Bổ sung quy trình gán số seri xuất kho tự động sinh bảo hành điện tử (FR-07.5, Wireframe Hình 13)
 */
import { mountAdminLayout } from '../components/adminLayout.js';
import { mockService } from '../services/mockService.js';
import { formatVND, formatDate } from '../core/format.js';
import { esc } from '../core/dom.js';
import { openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

let orders = [];

export async function initAdminOrdersPage() {
  const allowed = mountAdminLayout('orders');
  if (!allowed) return;

  await loadOrders();
}

async function loadOrders() {
  orders = await mockService.getOrders();
  renderOrdersTable();
}

function renderOrdersTable() {
  const content = document.getElementById('orders-content');
  if (!content) return;

  const statusMeta = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    SHIPPING: { label: 'Đang giao & lắp', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    COMPLETED: { label: 'Đã hoàn tất', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border-rose-200' }
  };

  content.innerHTML = `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <i data-lucide="shopping-bag" class="w-6 h-6 text-[#DC2626]"></i>
          <span>Quản Lý Đơn Hàng & Xuất Kho (${orders.length})</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Xử lý đơn đặt hàng, bàn giao kỹ thuật viên và gán số seri kích hoạt bảo hành điện tử
        </p>
      </div>
    </div>

    <!-- Hộp hướng dẫn quy trình màu vàng (Wireframe Hình 13 SRS) -->
    <div class="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 text-xs text-amber-900 space-y-1.5 shadow-xs">
      <div class="flex items-center gap-2 font-bold text-amber-950">
        <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-700"></i>
        <span>Quy Trình Xử Lý Đơn Hàng Showroom Pha Hằng (FR-07.5 & Wireframe Hình 13):</span>
      </div>
      <p class="leading-relaxed">
        Khi chuyển trạng thái đơn hàng sang <strong>Đang giao & lắp đặt (SHIPPING)</strong>, nhân viên showroom bắt buộc phải bấm nút <strong>"Gán Số Seri"</strong> để gán số seri máy xuất kho (Tivi, Điều hòa, Tủ lạnh). Hệ thống sẽ tự động tạo hồ sơ bảo hành điện tử chính hãng để khách hàng tra cứu online.
      </p>
    </div>

    <!-- Bảng danh sách đơn hàng -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              <th class="p-3.5">Mã Đơn</th>
              <th class="p-3.5">Khách Hàng & SĐT</th>
              <th class="p-3.5">Địa Chỉ Lắp Đặt</th>
              <th class="p-3.5 text-right">Tổng Tiền</th>
              <th class="p-3.5 text-center">Thanh Toán</th>
              <th class="p-3.5 text-center">Số Seri Xuất Kho</th>
              <th class="p-3.5 text-center">Trạng Thái Đơn</th>
              <th class="p-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${orders.map(o => {
              const meta = statusMeta[o.status] || statusMeta.PENDING;
              return `
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 font-mono font-bold text-[#DC2626]">
                    #DH${o.id}
                  </td>
                  <td class="p-3.5">
                    <p class="font-bold text-slate-900">${esc(o.customerName || o.receiverName || 'Khách hàng')}</p>
                    <p class="text-slate-400 font-mono text-[11px]">${esc(o.phone || o.receiverPhone || '')}</p>
                  </td>
                  <td class="p-3.5 text-slate-600 max-w-[200px] truncate" title="${esc(o.address || o.shipAddress || '')}">
                    ${esc(o.address || o.shipAddress || 'Tại Showroom')}
                  </td>
                  <td class="p-3.5 text-right font-mono font-black text-slate-900">
                    ${formatVND(o.totalAmount || 0)}
                  </td>
                  <td class="p-3.5 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${o.paymentMethod === 'VIETQR' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}">
                      ${o.paymentMethod === 'VIETQR' ? 'VietQR' : 'COD'}
                    </span>
                  </td>
                  <td class="p-3.5 text-center">
                    ${o.serialNumber ? `
                      <span class="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[11px]">
                        ${esc(o.serialNumber)}
                      </span>
                    ` : `
                      <button
                        type="button"
                        class="btn-assign-serial px-2.5 py-1 rounded-lg bg-red-50 hover:bg-[#DC2626] text-[#DC2626] hover:text-white font-bold text-[11px] transition-colors cursor-pointer border border-red-200"
                        data-id="${o.id}"
                      >
                        + Gán Số Seri
                      </button>
                    `}
                  </td>
                  <td class="p-3.5 text-center">
                    <select
                      class="order-status-select h-8 px-2 rounded-lg border text-xs font-bold cursor-pointer outline-hidden ${meta.color}"
                      data-id="${o.id}"
                    >
                      <option value="PENDING" ${o.status === 'PENDING' ? 'selected' : ''}>Chờ xác nhận</option>
                      <option value="SHIPPING" ${o.status === 'SHIPPING' ? 'selected' : ''}>Đang giao & lắp</option>
                      <option value="COMPLETED" ${o.status === 'COMPLETED' ? 'selected' : ''}>Đã hoàn tất</option>
                      <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                  </td>
                  <td class="p-3.5 text-right">
                    <button
                      type="button"
                      class="btn-view-order px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      data-id="${o.id}"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindOrderTableEvents();
  window.lucide?.createIcons();
}

function bindOrderTableEvents() {
  // 1. Đổi trạng thái đơn hàng
  document.querySelectorAll('.order-status-select').forEach(sel => {
    sel.onchange = async () => {
      const id = Number(sel.dataset.id);
      const newStatus = sel.value;
      await mockService.updateOrderStatus(id, newStatus);
      toast.success(`Đã cập nhật trạng thái đơn hàng #DH${id} sang "${newStatus}"`);
      loadOrders();
    };
  });

  // 2. Gán số seri (FR-07.5)
  document.querySelectorAll('.btn-assign-serial').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      openAssignSerialModal(id);
    };
  });

  // 3. Xem chi tiết đơn
  document.querySelectorAll('.btn-view-order').forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const order = orders.find(o => o.id === id);
      if (!order) return;

      openModal({
        title: `Chi Tiết Đơn Hàng #DH${order.id}`,
        bodyHtml: `
          <div class="space-y-4 text-xs">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-medium">
              <p><span class="text-slate-500">Khách hàng:</span> <strong class="text-slate-900">${esc(order.customerName || order.receiverName || 'Khách hàng')}</strong></p>
              <p><span class="text-slate-500">Số điện thoại:</span> <strong class="text-slate-900 font-mono">${esc(order.phone || order.receiverPhone || '')}</strong></p>
              <p><span class="text-slate-500">Địa chỉ giao:</span> <strong class="text-slate-900">${esc(order.address || order.shipAddress || 'Tại Showroom')}</strong></p>
              <p><span class="text-slate-500">Hình thức thanh toán:</span> <strong class="text-slate-900">${order.paymentMethod}</strong></p>
              <p><span class="text-slate-500">Số seri kích hoạt:</span> <strong class="text-emerald-700 font-mono">${esc(order.serialNumber || 'Chưa gán')}</strong></p>
            </div>

            <div class="border border-slate-200 rounded-xl divide-y divide-slate-100 p-2">
              ${(order.items || []).map(i => `
                <div class="p-2 flex justify-between items-center">
                  <div>
                    <p class="font-bold text-slate-800">${esc(i.productName)}</p>
                    <p class="text-slate-400 text-[11px]">SL: ${i.quantity}</p>
                  </div>
                  <span class="font-mono font-bold text-slate-900">${formatVND((i.price || 0) * i.quantity)}</span>
                </div>
              `).join('')}
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
              <span class="font-bold text-slate-800">Tổng thu tiền:</span>
              <span class="font-black font-mono text-[#DC2626] text-base">${formatVND(order.totalAmount || 0)}</span>
            </div>
          </div>
        `,
        maxWidth: '460px'
      });
    };
  });
}

function openAssignSerialModal(orderId) {
  const modal = openModal({
    title: `Gán Số Seri Xuất Kho Cho Đơn #DH${orderId} (FR-07.5)`,
    bodyHtml: `
      <div class="space-y-4 text-xs">
        <p class="text-slate-600 leading-relaxed">
          Nhập mã số seri dán trên vỏ hộp hoặc thân máy xuất xưởng. Khi lưu, hệ thống sẽ tự động kích hoạt bảo hành điện tử chính hãng 24 tháng cho khách hàng.
        </p>

        <div class="space-y-1.5">
          <label class="block font-bold text-slate-800">Số Seri Máy (Serial No) <span class="text-[#DC2626]">*</span>:</label>
          <input
            type="text"
            id="input-serial-no"
            value="SN-PHAHANG-${Date.now().toString().slice(-6)}"
            placeholder="Ví dụ: SN-SNY-2026-999"
            class="w-full h-10 px-3 border border-slate-200 rounded-xl font-mono font-bold text-xs uppercase focus:border-[#DC2626] outline-hidden"
            required
          />
        </div>
      </div>
    `,
    footerHtml: `
      <button type="button" id="btn-save-serial" class="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
        Lưu Số Seri & Kích Hoạt Bảo Hành
      </button>
    `,
    maxWidth: '460px'
  });

  const saveBtn = modal.element.querySelector('#btn-save-serial');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const serial = modal.element.querySelector('#input-serial-no')?.value?.trim();
      if (!serial) {
        toast.warning('Vui lòng nhập số seri thiết bị!');
        return;
      }
      await mockService.assignSerialNumber(orderId, serial);
      toast.success(`Đã gán số seri ${serial} và kích hoạt bảo hành điện tử cho đơn #DH${orderId}!`);
      modal.close();
      loadOrders();
    };
  }
}

initAdminOrdersPage();
