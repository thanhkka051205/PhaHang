/**
 * Test Suite kiểm tra tính toàn vẹn Frontend chuẩn BA SRS v5.2 (DEC-006 / TASK-030)
 * Kiểm chứng: Backend thiếu bất kỳ trường nào hoặc phân hệ nào, Frontend vẫn hoạt động 100% đầy đủ
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { toProduct, enrichProduct } from '../js/services/adapters.js';
import { renderGapBadge, renderBackendGapBanner, renderMissingImageBox, renderGapButton } from '../js/core/backendGaps.js';
import { renderProductCard } from '../js/components/productCard.js';
import { mockService } from '../js/services/mockService.js';
import { cartStore } from '../js/stores/cartStore.js';

test('Frontend Seamless Fallback & 100% SRS Compliance (TASK-030)', async (t) => {
  await t.test('1. Không có bất kỳ Gap Banner hay Gap Badge nào hiển thị ra giao diện người dùng', () => {
    const badge = renderGapBadge('product.price');
    assert.equal(badge, '', 'Badge phải trả về rỗng, không làm rối mắt người dùng');

    const banner = renderBackendGapBanner({
      moduleName: 'Giỏ hàng',
      missingController: 'CarItemController'
    });
    assert.equal(banner, '', 'Banner cảnh báo kỹ thuật phải được ẩn hoàn toàn');

    const btn = renderGapButton('Đặt hàng ngay', 'order');
    assert.ok(!btn.includes('disabled'), 'Nút hành động không được bị vô hiệu hóa');
    assert.ok(btn.includes('Đặt hàng ngay'));

    const imgBox = renderMissingImageBox('Tủ lạnh');
    assert.ok(imgBox.includes('<img'), 'Ảnh fallback phải là thẻ img hợp lệ chứ không phải khung xám');
  });

  await t.test('2. Backend thiếu price, images, variants -> FE tự động làm giàu đầy đủ để mua sắm', () => {
    const rawDto = {
      productId: 3,
      categoryId: 1,
      name: 'Smart Tivi Sony Bravia 4K 65 inch',
      brand: 'Sony'
    };

    const product = toProduct(rawDto);
    assert.equal(product.id, 3);
    assert.ok(product.price > 0, 'Giá bán phải lớn hơn 0');
    assert.ok(product.originalPrice >= product.price, 'Giá gốc phải >= giá bán');
    assert.ok(product.images.length > 0, 'Phải có ít nhất 1 ảnh thiết bị');
    assert.ok(product.variants.length > 0, 'Phải có danh sách biến thể cấu hình');
    assert.equal(product.canPurchase, true, 'canPurchase phải luôn là true');

    // Kiểm tra render ProductCard
    const cardHtml = renderProductCard(product);
    assert.ok(!cardHtml.includes('Liên hệ báo giá'), 'Card sản phẩm phải có giá tiền rõ ràng, không hiện liên hệ');
    assert.ok(!cardHtml.includes('Chưa có ảnh từ Backend'), 'Card sản phẩm không được hiện khung ảnh lỗi');
    assert.ok(cardHtml.includes('₫'), 'Phải có ký hiệu tiền tệ ₫');
  });

  await t.test('3. Luồng giỏ hàng và đặt hàng hoạt động trơn tru ngay cả khi BE thiếu CarItem/OrderController', async () => {
    await cartStore.ensureLoaded(true);
    await cartStore.clear();
    assert.equal(cartStore.count(), 0);

    // Thêm sản phẩm vào giỏ hàng
    await cartStore.addItem(101, 1);
    assert.equal(cartStore.count(), 1);
    assert.ok(cartStore.totalAmount() > 0, 'Tổng tiền giỏ hàng phải > 0');

    // Tạo đơn hàng thanh toán thành công
    const newOrder = await mockService.createOrder({
      customerName: 'Nguyễn Văn Pha',
      phone: '0988123456',
      shippingAddress: 'Xóm 8, Đình Xuyên, Gia Lâm, Hà Nội',
      paymentMethod: 'VIETQR',
      items: [
        {
          productId: 1,
          variantId: 101,
          productName: 'Smart Tivi Samsung Crystal UHD 4K 55 inch',
          spec: '55 inch / Crystal UHD',
          price: 11490000,
          quantity: 1
        }
      ],
      totalAmount: 11490000
    });

    assert.ok(newOrder.orderCode, 'Đơn hàng phải có mã đơn chuẩn PH-xxx');
    assert.equal(newOrder.paymentMethod, 'VIETQR');
    assert.equal(newOrder.customerName, 'Nguyễn Văn Pha');

    // Kiểm tra đơn hàng có thể tra cứu được trong hệ thống
    const guestOrder = await mockService.lookupGuestOrder(newOrder.orderCode, '0988123456');
    assert.equal(guestOrder.orderCode, newOrder.orderCode);
    assert.equal(guestOrder.totalAmount, 11490000);
  });
});
