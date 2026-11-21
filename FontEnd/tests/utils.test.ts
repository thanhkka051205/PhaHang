import { describe, it, expect } from 'vitest';
import { formatVND, formatDate, formatDateTime, removeVietnameseTones } from '../src/utils/format';
import { validateIMEI, validateSerial, maskPhone, maskName } from '../src/utils/imei';

describe('Format Utils (UI-04 & NFR-02.2)', () => {
  it('formatVND định dạng giá có dấu chấm ngăn cách hàng nghìn và đuôi ₫', () => {
    expect(formatVND(1000000)).toBe('1.000.000 ₫');
    expect(formatVND(28990000)).toBe('28.990.000 ₫');
    expect(formatVND(0)).toBe('0 ₫');
    expect(formatVND(null)).toBe('0 ₫');
    expect(formatVND(undefined)).toBe('0 ₫');
  });

  it('formatDate định dạng ngày theo chuẩn dd/MM/yyyy', () => {
    expect(formatDate('2026-10-31T10:00:00Z')).toBe('31/10/2026');
    expect(formatDate('2026-05-05')).toBe('05/05/2026');
    expect(formatDate(null)).toBe('');
    expect(formatDate('invalid-date')).toBe('');
  });

  it('formatDateTime hiển thị cả giờ phút và ngày tháng', () => {
    const res = formatDateTime('2026-10-15T08:30:00Z');
    expect(res).toContain('15/10/2026');
  });

  it('removeVietnameseTones chuẩn hóa chuỗi tiếng Việt không dấu (NFR-02.2)', () => {
    expect(removeVietnameseTones('Cáp Sạc Nhanh')).toBe('cap sac nhanh');
    expect(removeVietnameseTones('Đồng Hồ Apple Watch')).toBe('dong ho apple watch');
    expect(removeVietnameseTones('Ốp lưng & Kính cường lực')).toBe('op lung & kinh cuong luc');
    expect(removeVietnameseTones('')).toBe('');
  });
});

describe('IMEI & Privacy Utils (BR-03, BR-11)', () => {
  it('validateSerial chấp nhận chuỗi 6 đến 20 ký tự chữ và số theo FR-07.5 và Bảng 44', () => {
    expect(validateSerial('SN-SONY-55X75K')).toBe(true);
    expect(validateSerial('DAIKIN9000-2026')).toBe(true);
    expect(validateSerial('A1B2C3')).toBe(true); // 6 ký tự
    expect(validateSerial('12345')).toBe(false); // Quá ngắn (< 6)
    expect(validateSerial('123456789012345678901')).toBe(false); // Quá dài (> 20)
    expect(validateSerial('')).toBe(false);
  });

  it('validateIMEI chỉ chấp nhận chuỗi đúng 15 chữ số', () => {
    expect(validateIMEI('352849102938475')).toBe(true);
    expect(validateIMEI('123456789012345')).toBe(true);
    expect(validateIMEI('12345')).toBe(false); // Quá ngắn
    expect(validateIMEI('1234567890123456')).toBe(false); // 16 số - quá dài
    expect(validateIMEI('35284910293847a')).toBe(false); // Chứa chữ cái
    expect(validateIMEI('')).toBe(false);
  });

  it('maskPhone che giấu các số giữa của số điện thoại', () => {
    expect(maskPhone('0981523966')).toBe('098****966');
    expect(maskPhone('0912345678')).toBe('091****678');
  });

  it('maskName che tên đệm của khách hàng', () => {
    expect(maskName('Nguyễn Văn An')).toBe('Nguyễn ** An');
    expect(maskName('Trần Thị Thu Khách')).toBe('Trần ** Khách');
  });
});
