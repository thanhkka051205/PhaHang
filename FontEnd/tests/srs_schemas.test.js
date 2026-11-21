/**
 * Test Suite kiểm tra 100% Trường Dữ Liệu theo chuẩn SRS v5.2 (DEC-008 / TASK-032)
 * Điện Máy Pha Hằng: Product, Category, CartItem, Order, Warranty, User, Coupon
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import {
  CORE_CATEGORIES,
  createCategorySchema,
  createProductSchema,
  createProductVariantSchema,
  createCartItemSchema,
  createOrderSchema,
  createWarrantySchema,
  createUserSchema,
  createCouponSchema
} from '../js/models/srsSchemas.js';

test('1. Master Category Schema & 5 Ngành hàng cốt lõi (FR-02, SCR-01)', async (t) => {
  await t.test('Nạp đủ 5 ngành hàng lớn và các nhóm con phân loại', () => {
    assert.equal(CORE_CATEGORIES.length, 18);
    const parentCats = CORE_CATEGORIES.filter(c => c.parentId === null);
    assert.equal(parentCats.length, 5, 'Bắt buộc đúng 5 ngành hàng gốc');
    
    const names = parentCats.map(c => c.name);
    assert.ok(names.includes('Ti vi'));
    assert.ok(names.includes('Điều hòa'));
    assert.ok(names.includes('Tủ lạnh'));
    assert.ok(names.includes('Quạt'));
    assert.ok(names.includes('Nồi cơm điện'));
  });

  await t.test('createCategorySchema chuẩn hóa đầy đủ trường', () => {
    const cat = createCategorySchema({ id: 1, name: 'Ti vi Smart' });
    assert.equal(cat.id, 1);
    assert.equal(cat.categoryId, 1);
    assert.equal(cat.name, 'Ti vi Smart');
    assert.equal(cat.isActive, true);
    assert.ok(Array.isArray(cat.brands));
  });
});

test('2. Master Product & Variant Schema (FR-02, FR-03, FR-08, DAT-01)', async (t) => {
  await t.test('createProductSchema có đủ 100% trường SRS kể cả khi DTO rỗng', () => {
    const prod = createProductSchema({});
    assert.equal(prod.name, '');
    assert.equal(prod.price, 0);
    assert.equal(prod.originalPrice, 0);
    assert.equal(prod.discountPercent, 0);
    assert.equal(prod.stockQty, 0);
    assert.equal(prod.warrantyMonths, 24);
    assert.equal(prod.isVisible, true);
    assert.equal(prod.trackSerial, false);
    assert.ok(Array.isArray(prod.images));
    assert.ok(Array.isArray(prod.variants));
    assert.equal(typeof prod.technicalSpecs, 'object');
  });

  await t.test('createProductVariantSchema xử lý đúng giá và tồn kho', () => {
    const v = createProductVariantSchema({
      id: 'v-101',
      name: '55 inch 4K',
      price: 15000000,
      originalPrice: 18000000,
      stockQty: 20
    });
    assert.equal(v.id, 'v-101');
    assert.equal(v.name, '55 inch 4K');
    assert.equal(v.price, 15000000);
    assert.equal(v.originalPrice, 18000000);
    assert.equal(v.stockQty, 20);
  });
});

test('3. Master CartItem Schema (FR-04, UC-04, Bảng 18 SRS)', async (t) => {
  await t.test('createCartItemSchema tự động tính subtotal và gán số lượng hợp lệ', () => {
    const item = createCartItemSchema({
      productId: 1,
      variantId: 'v-101',
      productName: 'Tivi Sony',
      price: 10000000,
      quantity: 2
    });
    assert.equal(item.productId, 1);
    assert.equal(item.variantId, 'v-101');
    assert.equal(item.price, 10000000);
    assert.equal(item.quantity, 2);
    assert.equal(item.subtotal, 20000000);
  });
});

test('4. Master Order Schema (FR-05, FR-06, FR-07, BR-01, BR-02, BR-11)', async (t) => {
  await t.test('createOrderSchema có đủ trường thông tin giao nhận, thanh toán và số seri', () => {
    const order = createOrderSchema({
      id: 1001,
      orderCode: 'PH-1001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0988123456',
      shippingAddress: 'Gia Lâm, Hà Nội',
      paymentMethod: 'VIETQR',
      items: [
        { productId: 1, price: 10000000, quantity: 1 }
      ],
      serialNumbers: ['SN-TV-001']
    });

    assert.equal(order.id, '1001');
    assert.equal(order.orderCode, 'PH-1001');
    assert.equal(order.customerName, 'Nguyễn Văn A');
    assert.equal(order.paymentMethod, 'VIETQR');
    assert.equal(order.paymentStatus, 'UNPAID');
    assert.equal(order.orderStatus, 'PENDING');
    assert.equal(order.totalAmount, 10000000);
    assert.deepEqual(order.serialNumbers, ['SN-TV-001']);
  });
});

test('5. Master Warranty Schema (FR-12, UC-12, Wireframe Hình 14)', async (t) => {
  await t.test('createWarrantySchema quản lý đầy đủ số seri và thông tin bảo hành showroom', () => {
    const w = createWarrantySchema({
      serialNo: 'SN-DH-12345',
      productId: 2,
      productName: 'Điều hòa Daikin',
      customerName: 'Trần Thị B',
      customerPhone: '0912345678',
      warrantyMonths: 24
    });

    assert.equal(w.serialNo, 'SN-DH-12345');
    assert.equal(w.productName, 'Điều hòa Daikin');
    assert.equal(w.warrantyMonths, 24);
    assert.equal(w.status, 'ACTIVE');
    assert.ok(w.showroomAddress.includes('Gia Lâm, Hà Nội'));
  });
});

test('6. Master User Schema (FR-01, FR-11, DEC-001, Nghị định 13/2023)', async (t) => {
  await t.test('createUserSchema chuẩn hóa quyền và cờ bảo vệ dữ liệu cá nhân', () => {
    const u = createUserSchema({
      id: 1,
      fullName: 'Quản trị viên',
      email: 'admin@phahang.vn',
      role: 'ROLE_ADMIN',
      agreedPrivacyPolicy: true
    });

    assert.equal(u.id, 1);
    assert.equal(u.fullName, 'Quản trị viên');
    assert.equal(u.role, 'ADMIN');
    assert.equal(u.agreedPrivacyPolicy, true);
    assert.equal(u.isActive, true);
  });
});

test('7. Master Coupon Schema (FR-09, UC-09, BR-04)', async (t) => {
  await t.test('createCouponSchema quản lý mã giảm giá chuẩn', () => {
    const c = createCouponSchema({
      code: 'phahang50k',
      discountType: 'AMOUNT',
      discountValue: 50000,
      minOrderValue: 2000000
    });

    assert.equal(c.code, 'PHAHANG50K');
    assert.equal(c.discountType, 'AMOUNT');
    assert.equal(c.discountValue, 50000);
    assert.equal(c.minOrderValue, 2000000);
    assert.equal(c.isActive, true);
  });
});
