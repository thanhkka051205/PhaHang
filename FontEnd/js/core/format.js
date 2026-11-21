/**
 * Định dạng tiền tệ và thời gian chuẩn UI-04, tìm kiếm không dấu DEC-002
 */

/**
 * Định dạng tiền tệ Việt Nam Đồng (UI-04): 1.000.000 ₫
 */
export function formatVND(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ₫';
  }
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} ₫`;
}

/**
 * Định dạng ngày (UI-04): dd/MM/yyyy
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng ngày giờ: HH:mm dd/MM/yyyy
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

/**
 * Chuẩn hóa chuỗi tiếng Việt không dấu (DEC-002 / NFR-02.2)
 * Hỗ trợ tìm kiếm không dấu: "ti vi", "dieu hoa", "tu lanh", "noi com", "quat"
 */
export function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
