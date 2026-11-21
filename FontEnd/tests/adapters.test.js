/**
 * Test Suite kiểm tra Adapter mapping DTO Backend PhaHang Spring Boot sang Frontend Model
 * Repo tham chiếu: https://github.com/thanhkka051205/PhaHang
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import {
  toCategory,
  fromCategory,
  toProduct,
  enrichProduct,
  fromProduct,
  toUser,
  fromUser,
  toAddress,
  fromAddress,
  normalizeRole,
  denormalizeRole,
  unwrapRestResponse,
  unwrapPaginated,
  toLoginSession
} from '../js/services/adapters.js';
import { apiClient } from '../js/services/apiClient.js';

test('Khớp dữ liệu DTO Category (CategoryResponseDTO)', async (t) => {
  await t.test('Chuyển đổi CategoryResponseDTO sang Category FE', () => {
    const dto = { categoryId: 10, name: 'Điều hòa không khí' };
    const model = toCategory(dto);
    assert.equal(model.id, 10);
    assert.equal(model.categoryId, 10);
    assert.equal(model.name, 'Điều hòa không khí');
  });

  await t.test('Chuyển đổi Category FE sang payload gửi BE', () => {
    const model = { id: 10, name: 'Tivi OLED' };
    const payload = fromCategory(model);
    assert.equal(payload.categoryId, 10);
    assert.equal(payload.name, 'Tivi OLED');
  });
});

test('Khớp dữ liệu DTO Product (ProductResponseDTO)', async (t) => {
  await t.test('Chuyển đổi ProductResponseDTO đầy đủ sang Product FE', () => {
    const dto = {
      productId: 5,
      categoryId: 2,
      categoryName: 'Điều hòa',
      name: 'Điều hòa Daikin Inverter 1 HP',
      brand: 'Daikin',
      description: 'Tiết kiệm điện tối ưu, phin lọc Enzyme Blue',
      warrantyMonths: 24,
      trackSerial: true,
      isVisible: true
    };

    const model = toProduct(dto, { price: 9500000 });
    assert.equal(model.id, 5);
    assert.equal(model.name, 'Điều hòa Daikin Inverter 1 HP');
    assert.equal(model.brand, 'Daikin');
    assert.equal(model.categoryName, 'Điều hòa');
    assert.equal(model.warrantyMonths, 24);
    assert.equal(model.trackSerial, true);
    assert.equal(model.isVisible, true);
    assert.equal(model.price, 9500000);
    assert.ok(model.images.length > 0);
  });

  await t.test('Xử lý sản phẩm có isVisible = false và trackSerial = false', () => {
    const dto = {
      productId: 8,
      name: 'Quạt Senko cũ',
      brand: 'Senko',
      warrantyMonths: 0,
      trackSerial: false,
      isVisible: false
    };

    const model = toProduct(dto);
    assert.equal(model.isVisible, false);
    assert.equal(model.trackSerial, false);
    assert.equal(model.warrantyMonths, 0);
  });

  await t.test('Chuyển đổi Product FE sang payload gửi POST/PUT ProductController', () => {
    const feModel = {
      id: 5,
      categoryId: 2,
      name: 'Điều hòa Daikin 1HP',
      brand: 'Daikin',
      description: 'Mô tả',
      warrantyMonths: 24,
      trackSerial: true,
      isVisible: true
    };

    const payload = fromProduct(feModel);
    assert.equal(payload.productId, 5);
    assert.deepEqual(payload.category, { categoryId: 2 });
    assert.equal(payload.name, 'Điều hòa Daikin 1HP');
    assert.equal(payload.brand, 'Daikin');
    assert.equal(payload.warrantyMonths, 24);
    assert.equal(payload.trackSerial, true);
    assert.equal(payload.isVisible, true);
  });
});

test('Khớp dữ liệu DTO User (User Entity)', async (t) => {
  await t.test('Chuyển đổi User Entity sang User FE', () => {
    const entity = {
      userId: 101,
      fullName: 'Trần Văn Pha',
      email: 'phahang@example.com',
      phone: '0988123456',
      role: 'admin',
      status: true,
      createdAt: '2026-11-01T10:00:00'
    };

    const model = toUser(entity);
    assert.equal(model.id, 101);
    assert.equal(model.fullName, 'Trần Văn Pha');
    assert.equal(model.email, 'phahang@example.com');
    assert.equal(model.phone, '0988123456');
    assert.equal(model.role, 'ADMIN');
    assert.equal(model.status, true);
  });

  await t.test('Chuyển đổi User FE sang payload gửi UserController', () => {
    const feModel = {
      id: 101,
      fullName: 'Trần Văn Pha',
      email: 'phahang@example.com',
      phone: '0988123456',
      role: 'CUSTOMER',
      status: false
    };

    const payload = fromUser(feModel);
    assert.equal(payload.userId, 101);
    assert.equal(payload.fullName, 'Trần Văn Pha');
    assert.equal(payload.role, 'customer');
    assert.equal(payload.status, false);
  });
});

test('Khớp dữ liệu DTO Address (AddressResponseDTO)', async (t) => {
  await t.test('Chuyển đổi AddressResponseDTO sang Address FE', () => {
    const dto = {
      addressId: 12,
      receiverName: 'Nguyễn Thị Hằng',
      receiverPhone: '0912345678',
      addressDetail: 'Số 10 Trâu Quỳ, Gia Lâm, Hà Nội',
      isDefault: true
    };

    const model = toAddress(dto);
    assert.equal(model.id, 12);
    assert.equal(model.receiverName, 'Nguyễn Thị Hằng');
    assert.equal(model.receiverPhone, '0912345678');
    assert.equal(model.addressDetail, 'Số 10 Trâu Quỳ, Gia Lâm, Hà Nội');
    assert.equal(model.isDefault, true);
  });

  await t.test('Chuyển đổi Address FE sang payload gửi AddressController', () => {
    const model = {
      id: 12,
      receiverName: 'Nguyễn Thị Hằng',
      receiverPhone: '0912345678',
      addressDetail: 'Số 10 Trâu Quỳ, Gia Lâm',
      isDefault: false
    };

    const payload = fromAddress(model, 101);
    assert.equal(payload.addressId, 12);
    assert.deepEqual(payload.user, { userId: 101 });
    assert.equal(payload.receiverName, 'Nguyễn Thị Hằng');
    assert.equal(payload.isDefault, false);
  });
});

test('Quy tắc Data Enrichment & Seamless Fallback theo chuẩn BA SRS v5.2 (DEC-006 / TASK-030)', async (t) => {
  await t.test('Tự động bù đắp giá/ảnh/biến thể khi Backend chỉ trả về các trường tối thiểu', () => {
    const minimalDto = {
      productId: 1,
      categoryId: 1,
      name: 'Smart Tivi OLED 4K 55 inch',
      brand: 'LG',
      description: 'Màn hình OLED sắc nét, âm thanh Dolby Atmos',
      warrantyMonths: 24,
      trackSerial: true,
      isVisible: true
    };

    // Kiểm tra với cả toProduct và enrichProduct
    const model = enrichProduct(minimalDto);
    const toProductModel = toProduct(minimalDto);

    // 1. Giữ nguyên các trường Backend trả về
    assert.equal(model.id, 1);
    assert.equal(model.productId, 1);
    assert.equal(model.categoryId, 1);
    assert.equal(model.name, 'Smart Tivi OLED 4K 55 inch');
    assert.equal(model.brand, 'LG');
    assert.equal(model.description, 'Màn hình OLED sắc nét, âm thanh Dolby Atmos');
    assert.equal(model.warrantyMonths, 24);
    assert.equal(model.trackSerial, true);
    assert.equal(model.isVisible, true);

    // 2. Tự động bù đắp giá chuẩn SRS: price > 0, canPurchase là true
    assert.ok(model.price > 0, 'Tự động bù đắp giá bán theo chuẩn SRS');
    assert.equal(model.hasPrice, true);
    assert.equal(model.canPurchase, true, 'Luôn mở khóa nút mua hàng theo SRS');

    // 3. Tự động bù đắp ảnh chuẩn SRS: images có phần tử, hasImages là true
    assert.ok(Array.isArray(model.images) && model.images.length > 0, 'Tự động bù đắp ảnh sắc nét');
    assert.equal(model.hasImages, true);

    // 4. Tự động bù đắp biến thể: variants có phần tử
    assert.ok(Array.isArray(model.variants) && model.variants.length > 0, 'Tự động bù đắp biến thể cấu hình');
    assert.equal(model.hasVariants, true);

    // Đảm bảo toProduct và enrichProduct đồng nhất
    assert.equal(toProductModel.price, model.price);
    assert.equal(toProductModel.images.length, model.images.length);
    assert.equal(toProductModel.variants.length, model.variants.length);
  });

  await t.test('Xử lý an toàn cho sản phẩm mới/lạ không có giá hoặc ảnh', () => {
    const unknownDto = {
      productId: 99999,
      categoryId: 88888,
      name: 'Thiết bị công nghệ thông minh thế hệ mới',
      brand: 'GenericTech',
      description: 'Mô tả thử nghiệm sản phẩm mới hoàn toàn',
      warrantyMonths: 12,
      trackSerial: false,
      isVisible: true
    };

    const model = enrichProduct(unknownDto);
    assert.equal(model.id, 99999);
    assert.equal(model.brand, 'GenericTech');
    assert.ok(model.price > 0, 'Tự động gán giá cơ sở an toàn');
    assert.ok(model.images.length > 0, 'Gán ảnh mặc định an toàn');
    assert.equal(model.canPurchase, true, 'Mở khóa nút mua hàng');
  });

  await t.test('Ưu tiên dữ liệu của Backend khi Backend có truyền sẵn price, images hoặc variants', () => {
    const dtoWithCustomData = {
      productId: 2,
      categoryId: 1,
      name: 'Smart Tivi Sony 4K',
      brand: 'Sony',
      description: 'Âm thanh vòm đỉnh cao',
      warrantyMonths: 24,
      trackSerial: true,
      isVisible: true,
      price: 18900000,
      originalPrice: 22000000,
      images: [
        'https://example.com/custom-sony-1.jpg',
        'https://example.com/custom-sony-2.jpg'
      ],
      discountPercent: 14
    };

    const model = enrichProduct(dtoWithCustomData);

    // Ưu tiên giá từ Backend
    assert.equal(model.price, 18900000, 'Giá phải lấy chính xác từ Backend');
    assert.equal(model.originalPrice, 22000000, 'Giá niêm yết phải lấy từ Backend');
    assert.equal(model.discountPercent, 14, 'Phần trăm giảm giá lấy từ Backend');

    // Ưu tiên danh sách hình ảnh từ Backend
    assert.equal(model.images.length, 2);
    assert.equal(model.images[0], 'https://example.com/custom-sony-1.jpg');
    assert.equal(model.images[1], 'https://example.com/custom-sony-2.jpg');
    assert.equal(model.thumbnail, 'https://example.com/custom-sony-1.jpg');

    // Biến thể đầu tiên phản ánh đúng giá từ Backend
    assert.equal(model.variants[0].price, 18900000);
  });
});

test('Chuẩn hóa Role, RestResponse và LoginSession (Auth & User Adapters)', async (t) => {
  await t.test('normalizeRole: chuẩn hóa các biến thể role BE sang FE', () => {
    assert.equal(normalizeRole('ROLE_CUSTOM'), 'CUSTOMER');
    assert.equal(normalizeRole('ROLE_CUSTOMER'), 'CUSTOMER');
    assert.equal(normalizeRole('custom'), 'CUSTOMER');
    assert.equal(normalizeRole('CUSTOMER'), 'CUSTOMER');
    assert.equal(normalizeRole('ROLE_STAFF'), 'STAFF');
    assert.equal(normalizeRole('  role_staff  '), 'STAFF');
    assert.equal(normalizeRole('ROLE_ADMIN'), 'ADMIN');
    assert.equal(normalizeRole('admin'), 'ADMIN');
    assert.equal(normalizeRole(''), 'CUSTOMER');
    assert.equal(normalizeRole(null), 'CUSTOMER');
    assert.equal(normalizeRole(undefined), 'CUSTOMER');
    assert.equal(normalizeRole('UNKNOWN_ROLE'), 'CUSTOMER');
  });

  await t.test('denormalizeRole: chuyển role FE sang Spring Security role BE', () => {
    assert.equal(denormalizeRole('CUSTOMER'), 'ROLE_CUSTOM');
    assert.equal(denormalizeRole('ROLE_CUSTOM'), 'ROLE_CUSTOM');
    assert.equal(denormalizeRole('STAFF'), 'ROLE_STAFF');
    assert.equal(denormalizeRole('ADMIN'), 'ROLE_ADMIN');
    assert.equal(denormalizeRole(null), 'ROLE_CUSTOM');
  });

  await t.test('unwrapRestResponse: mở bọc RestResponse<T> hợp lệ, lỗi >= 400 và dữ liệu thô', () => {
    const ok = unwrapRestResponse({ statusCode: 200, message: 'OK', data: { id: 1, name: 'Test' } });
    assert.deepEqual(ok, { id: 1, name: 'Test' });

    const createdNull = unwrapRestResponse({ statusCode: 201, message: 'Created', data: null });
    assert.equal(createdNull, null);

    assert.throws(
      () => unwrapRestResponse({ statusCode: 400, message: 'Email đã tồn tại', data: null }),
      (err) => err instanceof Error && err.message === 'Email đã tồn tại' && err.status === 400
    );

    assert.throws(
      () => unwrapRestResponse({ statusCode: 500, data: null }),
      (err) => err instanceof Error && err.status === 500
    );

    const rawObj = { id: 9, name: 'Raw' };
    assert.deepEqual(unwrapRestResponse(rawObj), rawObj);
    assert.equal(unwrapRestResponse(null), null);
    assert.equal(unwrapRestResponse(undefined), undefined);
  });

  await t.test('toUser: xử lý ROLE_CUSTOM, isActive/status và null', () => {
    assert.equal(toUser(null), null);
    assert.equal(toUser(undefined), null);

    const activeUser = toUser({
      userId: 12,
      fullName: 'Nguyễn Văn A',
      email: 'a@phahang.vn',
      phone: '0901234567',
      role: 'ROLE_CUSTOM',
      status: true
    });
    assert.equal(activeUser.id, 12);
    assert.equal(activeUser.userId, 12);
    assert.equal(activeUser.role, 'CUSTOMER');
    assert.equal(activeUser.isActive, true);
    assert.equal(activeUser.status, true);

    const lockedByStatus = toUser({
      userId: 13,
      email: 'locked1@phahang.vn',
      role: 'ROLE_STAFF',
      status: false
    });
    assert.equal(lockedByStatus.role, 'STAFF');
    assert.equal(lockedByStatus.isActive, false);
    assert.equal(lockedByStatus.status, false);

    const lockedByIsActive = toUser({
      id: 14,
      email: 'locked2@phahang.vn',
      role: 'ROLE_ADMIN',
      isActive: false
    });
    assert.equal(lockedByIsActive.role, 'ADMIN');
    assert.equal(lockedByIsActive.isActive, false);
    assert.equal(lockedByIsActive.status, false);
  });

  await t.test('toLoginSession: chuyển ResLoginDTO sang session FE và xử lý null', () => {
    const session = toLoginSession({
      accessToken: 'jwt.token.abc',
      user: {
        userId: 1,
        fullName: 'Admin Pha Hằng',
        email: 'admin@phahang.vn',
        role: 'ROLE_ADMIN',
        status: true
      }
    });
    assert.equal(session.token, 'jwt.token.abc');
    assert.equal(session.user.id, 1);
    assert.equal(session.user.role, 'ADMIN');
    assert.equal(session.user.isActive, true);

    const emptySession = toLoginSession(null);
    assert.equal(emptySession.token, null);
    assert.equal(emptySession.user, null);
  });
});

test('Phân trang ResultPaginationalDTO và Tích hợp Payment Backend afa9fde', async (t) => {
  await t.test('unwrapPaginated: xử lý chính xác ResultPaginationalDTO { meta, result }', () => {
    const backendResponse = {
      meta: { page: 2, pageSize: 12, pages: 5, total: 58 },
      result: [
        { productId: 101, name: 'Tivi OLED 55 inch', brand: 'Sony' },
        { productId: 102, name: 'Điều hòa Daikin 9000BTU', brand: 'Daikin' }
      ]
    };

    const paginated = unwrapPaginated(backendResponse, toProduct);
    assert.equal(paginated.meta.page, 2);
    assert.equal(paginated.meta.pageSize, 12);
    assert.equal(paginated.meta.pages, 5);
    assert.equal(paginated.meta.total, 58);
    assert.equal(paginated.items.length, 2);
    assert.equal(paginated.items[0].id, 101);
    assert.equal(paginated.items[0].brand, 'Sony');
    assert.ok(paginated.items[0].price > 0);
  });

  await t.test('unwrapPaginated: tương thích ngược mảng phẳng cũ', () => {
    const legacyArray = [
      { categoryId: 1, name: 'Tivi' },
      { categoryId: 2, name: 'Điều hòa' }
    ];

    const paginated = unwrapPaginated(legacyArray, toCategory);
    assert.equal(paginated.meta.page, 1);
    assert.equal(paginated.meta.pageSize, 2);
    assert.equal(paginated.meta.total, 2);
    assert.equal(paginated.items.length, 2);
    assert.equal(paginated.items[0].name, 'Tivi');
  });

  await t.test('apiClient.createPayment: gửi đúng định dạng và có fallback phi chặn', async () => {
    const res = await apiClient.createPayment({
      orderId: 9999,
      method: 'VIETQR',
      amount: 15500000,
      status: 'waiting'
    });
    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data.amount, 15500000);
  });
});


