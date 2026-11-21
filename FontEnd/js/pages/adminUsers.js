/**
 * Script Tài Khoản & Phân Quyền (admin/users.html)
 * Tái tạo 100% diện mạo và class Tailwind từ UserListView.vue (commit 1a9e3c2)
 */
import { mountAdminLayout } from '../components/adminLayout.js';
import { mockService } from '../services/mockService.js';
import { apiClient } from '../services/apiClient.js';
import { API_CONFIG } from '../config/apiConfig.js';
import { toUser } from '../services/adapters.js';
import { authStore } from '../stores/authStore.js';
import { formatDate } from '../core/format.js';
import { esc } from '../core/dom.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';

let users = [];

function isUsersApiEnabled() {
  return Boolean(API_CONFIG.USE_API && API_CONFIG.DOMAINS?.users !== 'local');
}

function shouldFallbackToMock(err) {
  return Boolean(err?.isNetworkError && API_CONFIG.FALLBACK_TO_MOCK);
}

export async function initAdminUsersPage() {
  const allowed = mountAdminLayout('users');
  if (!allowed) return;

  await loadUsers();
}

async function loadUsers() {
  try {
    if (isUsersApiEnabled()) {
      try {
        const res = await apiClient.getUsers();
        users = Array.isArray(res) ? res.map(toUser).filter(Boolean) : [];
      } catch (err) {
        if (shouldFallbackToMock(err)) {
          users = await mockService.getUsers();
        } else {
          throw err;
        }
      }
    } else {
      users = await mockService.getUsers();
    }
  } catch (err) {
    users = [];
    toast.error(err?.message || 'Không thể tải danh sách người dùng.');
  }
  renderUsersTable();
}

function renderUsersTable() {
  const content = document.getElementById('users-content');
  if (!content) return;

  content.innerHTML = `
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <i data-lucide="users" class="w-6 h-6 text-[#DC2626]"></i>
          <span>Tài Khoản & Phân Quyền Hệ Thống (${users.length})</span>
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Quản lý tài khoản khách hàng, nhân viên showroom và phân quyền vai trò (Admin, Staff, Customer)
        </p>
      </div>

      <button
        type="button"
        id="btn-add-staff"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-btn-brand transition-all cursor-pointer"
      >
        <i data-lucide="user-plus" class="w-4 h-4"></i>
        <span>Thêm Nhân Viên Mới</span>
      </button>
    </div>

    <!-- Bảng danh sách tài khoản -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              <th class="p-3.5">Họ & Tên</th>
              <th class="p-3.5">Email & SĐT</th>
              <th class="p-3.5">Địa Chỉ Khu Vực</th>
              <th class="p-3.5 text-center">Vai Trò (Phân Quyền)</th>
              <th class="p-3.5 text-center">Trạng Thái</th>
              <th class="p-3.5 text-center">Ngày Tạo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${users.map(u => `
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    ${esc(u.fullName.charAt(0).toUpperCase())}
                  </div>
                  <span>${esc(u.fullName)}</span>
                </td>
                <td class="p-3.5">
                  <p class="text-slate-900 font-medium">${esc(u.email)}</p>
                  <p class="text-slate-400 font-mono text-[11px]">${esc(u.phone || 'Chưa cập nhật')}</p>
                </td>
                <td class="p-3.5 text-slate-600">
                  ${esc(u.address || 'Hà Nội')}
                </td>
                <td class="p-3.5 text-center">
                  <select
                    class="user-role-select h-8 px-2 rounded-lg border text-xs font-bold cursor-pointer outline-hidden ${u.role === 'ADMIN' ? 'bg-red-50 text-[#DC2626] border-red-200' : u.role === 'STAFF' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}"
                    data-id="${u.id}"
                    data-prev-role="${esc(u.role)}"
                    data-name="${esc(u.fullName)}"
                  >
                    <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>Khách hàng (Customer)</option>
                    <option value="STAFF" ${u.role === 'STAFF' ? 'selected' : ''}>Nhân viên (Staff)</option>
                    <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>Quản trị viên (Admin)</option>
                  </select>
                </td>
                <td class="p-3.5 text-center">
                  <button
                    type="button"
                    class="btn-toggle-status px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${u.status !== false && u.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'}"
                    data-id="${u.id}"
                    data-status="${u.status !== false && u.isActive !== false}"
                    title="Bấm để đổi trạng thái tài khoản"
                  >
                    ${u.status !== false && u.isActive !== false ? '● Hoạt động' : '○ Đã khóa'}
                  </button>
                </td>
                <td class="p-3.5 text-center font-mono text-slate-500">
                  ${formatDate(u.createdAt)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindUserEvents();
  window.lucide?.createIcons();
}

function bindUserEvents() {
  // Đổi vai trò tài khoản
  document.querySelectorAll('.user-role-select').forEach(sel => {
    sel.onchange = async () => {
      const id = Number(sel.dataset.id);
      const prevRole = sel.dataset.prevRole || 'CUSTOMER';
      const newRole = sel.value;
      const userName = sel.dataset.name || `#${id}`;
      const currentAdmin = authStore.getAdminUser();

      if (currentAdmin?.id != null && Number(currentAdmin.id) === id) {
        sel.value = prevRole;
        toast.warning('Bạn không thể tự thay đổi vai trò của chính mình.');
        return;
      }

      const confirmed = await confirmDialog({
        title: 'Xác nhận đổi vai trò',
        message: `Bạn có chắc chắn muốn đổi vai trò tài khoản "${userName}" từ ${prevRole} sang ${newRole}?`,
        confirmText: 'Xác nhận',
        cancelText: 'Hủy bỏ',
        danger: newRole === 'ADMIN'
      });

      if (!confirmed) {
        sel.value = prevRole;
        return;
      }

      try {
        if (isUsersApiEnabled()) {
          try {
            await apiClient.updateUserRole(id, newRole);
          } catch (err) {
            if (shouldFallbackToMock(err)) {
              await mockService.updateUserRole(id, newRole);
            } else {
              throw err;
            }
          }
        } else {
          await mockService.updateUserRole(id, newRole);
        }

        toast.success(`Đã cập nhật phân quyền người dùng sang ${newRole}!`);
        await loadUsers();
      } catch (err) {
        sel.value = prevRole;
        toast.error(err?.message || 'Không thể cập nhật phân quyền người dùng.');
      }
    };
  });

  // Đổi trạng thái hoạt động tài khoản (status: boolean)
  document.querySelectorAll('.btn-toggle-status').forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);
      const currentStatus = btn.dataset.status === 'true';
      const newStatus = !currentStatus;
      const targetUser = users.find(u => Number(u.id) === id);

      try {
        if (isUsersApiEnabled()) {
          const payload = targetUser
            ? {
                fullName: targetUser.fullName,
                email: targetUser.email,
                phone: targetUser.phone,
                role: (targetUser.role || 'CUSTOMER').toLowerCase(),
                status: newStatus
              }
            : { status: newStatus };

          try {
            await apiClient.updateUser(id, payload);
          } catch (err) {
            if (shouldFallbackToMock(err)) {
              await mockService.updateUserStatus(id, newStatus);
            } else {
              throw err;
            }
          }
        } else {
          await mockService.updateUserStatus(id, newStatus);
        }

        toast.info(`Tài khoản đã được chuyển sang trạng thái: ${newStatus ? 'Hoạt động' : 'Tạm khóa'}`);
        await loadUsers();
      } catch (err) {
        toast.error(err?.message || 'Không thể cập nhật trạng thái tài khoản.');
      }
    };
  });

  // Thêm tài khoản nhân viên mới
  document.getElementById('btn-add-staff')?.addEventListener('click', () => {
    const modal = openModal({
      title: 'Thêm Tài Khoản Nhân Viên Showroom (FR-11.6)',
      bodyHtml: `
        <form id="new-staff-form" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Họ tên nhân viên <span class="text-[#DC2626]">*</span>:</label>
            <input type="text" id="staff-name" placeholder="Ví dụ: Lê Thị Mai" class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email đăng nhập <span class="text-[#DC2626]">*</span>:</label>
            <input type="email" id="staff-email" placeholder="nhanvien2@phahang.vn" class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Số điện thoại:</label>
            <input type="tel" id="staff-phone" placeholder="0988111222" class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mật khẩu khởi tạo <span class="text-[#DC2626]">*</span>:</label>
            <input type="password" id="staff-pass" value="staff123" minlength="8" class="w-full h-10 px-3.5 border border-slate-200 rounded-xl font-semibold focus:border-[#DC2626] outline-hidden font-mono" required />
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" id="btn-save-staff" class="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer">
          Khởi Tạo Tài Khoản
        </button>
      `,
      maxWidth: '460px'
    });

    modal.element.querySelector('#btn-save-staff')?.addEventListener('click', async () => {
      const name = modal.element.querySelector('#staff-name')?.value?.trim();
      const email = modal.element.querySelector('#staff-email')?.value?.trim();
      const phone = modal.element.querySelector('#staff-phone')?.value?.trim();
      const password = modal.element.querySelector('#staff-pass')?.value || '';

      if (!name || !email) {
        toast.warning('Vui lòng điền đủ họ tên và email!');
        return;
      }
      if (password.length < 8) {
        toast.warning('Mật khẩu khởi tạo phải có tối thiểu 8 ký tự!');
        return;
      }

      const payload = {
        fullName: name,
        email,
        phone,
        password,
        role: 'STAFF',
        address: 'Showroom Đình Xuyên, Gia Lâm'
      };

      try {
        if (isUsersApiEnabled()) {
          try {
            await apiClient.createUser(payload);
          } catch (err) {
            if (shouldFallbackToMock(err)) {
              await mockService.createUser(payload);
            } else {
              throw err;
            }
          }
        } else {
          await mockService.createUser(payload);
        }

        toast.success(`Đã tạo tài khoản nhân viên ${name} thành công!`);
        modal.close();
        await loadUsers();
      } catch (err) {
        toast.error(err?.message || 'Không thể khởi tạo tài khoản nhân viên.');
      }
    });
  });
}

initAdminUsersPage();
