import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { cartStore } from '../js/stores/cartStore.js';
import { initMockDB } from '../js/services/mockService.js';

test('Quản lý giỏ hàng toàn cục (Cart Store)', async (t) => {
  initMockDB();
  await cartStore.clear();

  await t.test('Giỏ hàng ban đầu rỗng', () => {
    assert.equal(cartStore.count(), 0);
    assert.equal(cartStore.totalAmount(), 0);
    assert.deepEqual(cartStore.getItems(), []);
  });

  await t.test('Thêm sản phẩm vào giỏ hàng', async () => {
    // Thêm variant 101 (Tivi Samsung 55 inch - 9.890.000 ₫)
    await cartStore.addItem(101, 1);
    assert.equal(cartStore.count(), 1);
    assert.equal(cartStore.totalAmount(), 9890000);

    // Thêm tiếp 1 cái cùng loại -> số lượng tăng thành 2
    await cartStore.addItem(101, 1);
    assert.equal(cartStore.count(), 2);
    assert.equal(cartStore.totalAmount(), 9890000 * 2);
  });

  await t.test('Cập nhật số lượng sản phẩm', async () => {
    await cartStore.updateQuantity(101, 3);
    assert.equal(cartStore.count(), 3);
    assert.equal(cartStore.totalAmount(), 9890000 * 3);
  });

  await t.test('Xóa sản phẩm khỏi giỏ', async () => {
    await cartStore.removeItem(101);
    assert.equal(cartStore.count(), 0);
    assert.equal(cartStore.totalAmount(), 0);
  });

  await t.test('Làm trống toàn bộ giỏ hàng', async () => {
    await cartStore.addItem(101, 1);
    await cartStore.addItem(501, 1);
    assert.equal(cartStore.count(), 2);

    await cartStore.clear();
    assert.equal(cartStore.count(), 0);
    assert.equal(cartStore.totalAmount(), 0);
  });
});
