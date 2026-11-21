import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatVND, formatDate, formatDateTime, removeVietnameseTones } from '../js/core/format.js';

test('formatVND định dạng số tiền VND theo chuẩn UI-04', () => {
  assert.equal(formatVND(15500000), '15.500.000 ₫');
  assert.equal(formatVND(9490000), '9.490.000 ₫');
  assert.equal(formatVND(549000), '549.000 ₫');
  assert.equal(formatVND(0), '0 ₫');
  assert.equal(formatVND(null), '0 ₫');
  assert.equal(formatVND(undefined), '0 ₫');
  assert.equal(formatVND(NaN), '0 ₫');
});

test('formatDate định dạng ngày dd/MM/yyyy theo chuẩn UI-04', () => {
  assert.equal(formatDate('2026-11-05T08:00:00Z'), '05/11/2026');
  assert.equal(formatDate('2026-01-01'), '01/01/2026');
  assert.equal(formatDate(null), '');
  assert.equal(formatDate(undefined), '');
  assert.equal(formatDate('invalid-date'), '');
});

test('removeVietnameseTones loại bỏ dấu tiếng Việt chính xác (DEC-002)', () => {
  assert.equal(removeVietnameseTones('Điều hòa Daikin Inverter'), 'dieu hoa daikin inverter');
  assert.equal(removeVietnameseTones('Tủ lạnh Side by Side'), 'tu lanh side by side');
  assert.equal(removeVietnameseTones('Smart Tivi 4K OLED'), 'smart tivi 4k oled');
  assert.equal(removeVietnameseTones('Nồi cơm điện tử Cuckoo'), 'noi com dien tu cuckoo');
  assert.equal(removeVietnameseTones('Quạt đứng Senko'), 'quat dung senko');
  assert.equal(removeVietnameseTones('Đình Xuyên Gia Lâm'), 'dinh xuyen gia lam');
  assert.equal(removeVietnameseTones(''), '');
  assert.equal(removeVietnameseTones(null), '');
});
