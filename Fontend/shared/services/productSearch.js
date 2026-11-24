/**
 * Dịch vụ tìm kiếm & gợi ý sản phẩm thông minh (REQ-002, DEC-002, DEC-003)
 */
import { mockService } from './mockService.js';
import { removeVietnameseTones } from '../core/format.js';

let indexedProducts = [];
let isLoaded = false;
let loadPromise = null;

export async function ensureProductsLoaded() {
  if (isLoaded) return indexedProducts;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await mockService.getProducts({ limit: 100 });
      indexedProducts = (res.items || []).map(p => {
        const prices = (p.variants || []).map(v => v.price).filter(pr => typeof pr === 'number' && !isNaN(pr));
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        return {
          id: p.id,
          name: p.name,
          brand: p.brand,
          categoryName: p.categoryName || '',
          thumbnail: p.thumbnail,
          minPrice,
          normalizedName: removeVietnameseTones(p.name),
          normalizedBrand: removeVietnameseTones(p.brand),
          normalizedDesc: removeVietnameseTones(p.description || ''),
          product: p
        };
      });
      isLoaded = true;
      return indexedProducts;
    } catch (err) {
      console.error('Lỗi khi nạp danh mục tìm kiếm:', err);
      return [];
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Tìm kiếm gợi ý sản phẩm theo từ khóa (hỗ trợ có dấu và không dấu, tối đa limit kết quả)
 */
export async function searchSuggestions(keyword, limit = 6) {
  if (!keyword || !keyword.trim()) return [];

  await ensureProductsLoaded();

  const rawNorm = removeVietnameseTones(keyword);
  const terms = rawNorm.split(/\s+/).filter(Boolean);

  if (terms.length === 0) return [];

  const matches = indexedProducts.filter(item => {
    const fullText = `${item.normalizedName} ${item.normalizedBrand} ${item.normalizedDesc}`;
    return terms.every(term => fullText.includes(term));
  });

  // Ưu tiên sản phẩm có tên bắt đầu bằng từ khóa hoặc chứa chính xác cụm từ
  matches.sort((a, b) => {
    const aStarts = a.normalizedName.startsWith(rawNorm) ? 1 : 0;
    const bStarts = b.normalizedName.startsWith(rawNorm) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;

    const aNameIncludes = a.normalizedName.includes(rawNorm) ? 1 : 0;
    const bNameIncludes = b.normalizedName.includes(rawNorm) ? 1 : 0;
    if (aNameIncludes !== bNameIncludes) return bNameIncludes - aNameIncludes;

    return a.name.length - b.name.length;
  });

  return matches.slice(0, limit);
}

export function _resetSearchIndexForTesting() {
  indexedProducts = [];
  isLoaded = false;
  loadPromise = null;
}
