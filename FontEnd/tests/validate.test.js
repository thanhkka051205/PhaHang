import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { validateEmail, validatePhone, showFieldError, clearFieldError } from '../js/core/validate.js';

test('Kiểm tra hàm tiện ích xác thực dữ liệu Form (UI-05)', async (t) => {
  await t.test('validateEmail nhận diện đúng định dạng', () => {
    assert.equal(validateEmail('user@gmail.com'), true);
    assert.equal(validateEmail('nhanvien@phahang.vn'), true);
    assert.equal(validateEmail('invalid-email'), false);
    assert.equal(validateEmail('user@'), false);
    assert.equal(validateEmail(''), false);
  });

  await t.test('validatePhone nhận diện đúng số điện thoại VN 10 số', () => {
    assert.equal(validatePhone('0988123456'), true);
    assert.equal(validatePhone('0912345678'), true);
    assert.equal(validatePhone('+84988123456'), true);
    assert.equal(validatePhone('0988 123 456'), true);
    assert.equal(validatePhone('12345'), false);
    assert.equal(validatePhone('0123456789'), false); // Đầu 01 cũ
    assert.equal(validatePhone(''), false);
  });

  await t.test('showFieldError và clearFieldError gắn và xóa lỗi nội dòng', () => {
    const dom = new JSDOM('<!DOCTYPE html><div><input id="test-inp" /></div>');
    const doc = dom.window.document;
    const parent = doc.querySelector('div');
    const input = doc.querySelector('#test-inp');

    // Cung cấp document tạm thời cho module validate nếu cần
    globalThis.document = doc;

    showFieldError(input, 'Ô này không được để trống.');
    assert.equal(input.getAttribute('aria-invalid'), 'true');
    assert.ok(input.classList.contains('border-rose-500'));

    const errorEl = parent.querySelector('.field-error');
    assert.ok(errorEl);
    assert.ok(errorEl.textContent.includes('Ô này không được để trống.'));

    clearFieldError(input);
    assert.equal(input.getAttribute('aria-invalid'), null);
    assert.equal(input.classList.contains('border-rose-500'), false);
    assert.equal(parent.querySelector('.field-error'), null);
  });
});
