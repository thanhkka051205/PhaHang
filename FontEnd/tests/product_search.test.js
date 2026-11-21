import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { searchSuggestions, _resetSearchIndexForTesting } from '../js/services/productSearch.js';
import { initMockDB } from '../js/services/mockService.js';

test('Tìm kiếm gợi ý sản phẩm thông minh (REQ-002, DEC-002, DEC-003)', async (t) => {
  initMockDB();
  _resetSearchIndexForTesting();

  await t.test('Tìm từ khóa có dấu "Điều hòa" trả về danh sách có điều hòa', async () => {
    const results = await searchSuggestions('Điều hòa', 6);
    assert.ok(results.length > 0, 'Phải tìm thấy ít nhất 1 sản phẩm');
    assert.ok(results.length <= 6, 'Không vượt quá 6 sản phẩm');
    assert.ok(results.some(r => r.name.toLowerCase().includes('điều hòa')));
  });

  await t.test('Tìm từ khóa không dấu "dieu hoa" trả về kết quả tương đương', async () => {
    const results = await searchSuggestions('dieu hoa', 6);
    assert.ok(results.length > 0);
    assert.ok(results.some(r => r.normalizedName.includes('dieu hoa')));
  });

  await t.test('Tìm theo thương hiệu "Senko" hoặc "Daikin"', async () => {
    const results = await searchSuggestions('senko', 6);
    assert.ok(results.length > 0);
    assert.ok(results.every(r => r.normalizedBrand === 'senko' || r.normalizedName.includes('senko')));
  });

  await t.test('Tìm kiếm từ khóa không tồn tại "xyz12345" trả về mảng rỗng', async () => {
    const results = await searchSuggestions('xyz12345', 6);
    assert.deepEqual(results, []);
  });

  await t.test('Từ khóa rỗng hoặc khoảng trắng trả về rỗng', async () => {
    assert.deepEqual(await searchSuggestions('', 6), []);
    assert.deepEqual(await searchSuggestions('   ', 6), []);
  });

  await t.test('Phân loại danh mục hiển thị trang chủ không bị rỗng (isProductInCategory)', async () => {
    const { isProductInCategory } = await import('../js/pages/home.js');
    const { INITIAL_PRODUCTS } = await import('./fixtures/testFixtures.js');

    const cat1 = INITIAL_PRODUCTS.filter(p => isProductInCategory(p, 1));
    const cat2 = INITIAL_PRODUCTS.filter(p => isProductInCategory(p, 2));
    const cat3 = INITIAL_PRODUCTS.filter(p => isProductInCategory(p, 3));
    const cat4 = INITIAL_PRODUCTS.filter(p => isProductInCategory(p, 4));
    const cat5 = INITIAL_PRODUCTS.filter(p => isProductInCategory(p, 5));

    assert.equal(cat1.length, 4, 'Ngành Ti vi phải có 4 sản phẩm');
    assert.equal(cat2.length, 4, 'Ngành Điều hòa phải có 4 sản phẩm');
    assert.equal(cat3.length, 4, 'Ngành Tủ lạnh phải có 4 sản phẩm');
    assert.equal(cat4.length, 3, 'Ngành Quạt phải có 3 sản phẩm');
    assert.equal(cat5.length, 3, 'Ngành Nồi cơm phải có 3 sản phẩm');

    // Tổng số sản phẩm được phân loại phải bằng toàn bộ 18 sản phẩm trong CSDL mock
    const totalMapped = cat1.length + cat2.length + cat3.length + cat4.length + cat5.length;
    assert.equal(totalMapped, INITIAL_PRODUCTS.length, 'Tất cả 18 sản phẩm phải hiển thị trên trang chủ');

    // "Quạt điều hòa" phải vào Quạt (Cat 4) chứ không lạc vào Điều hòa (Cat 2)
    const fanAirCooler = INITIAL_PRODUCTS.find(p => p.name.includes('Quạt điều hòa'));
    assert.ok(fanAirCooler);
    assert.equal(isProductInCategory(fanAirCooler, 4), true);
    assert.equal(isProductInCategory(fanAirCooler, 2), false);
  });
});
