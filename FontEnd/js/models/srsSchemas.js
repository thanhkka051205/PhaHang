/**
 * SRS v5.2 Master Data Contracts & Schemas
 * Website Bán Lẻ Điện Máy Pha Hằng (Gia Dụng & Điện Lạnh - 5 Ngành Hàng)
 * 
 * Nguyên tắc:
 * 1. Zero Runtime Mock Data: Không chứa dữ liệu hạt giống ảo; khi Backend chưa trả về thì trả trạng thái rỗng chuẩn.
 * 2. 100% SRS Field Compliance: FE định nghĩa và đảm bảo đầy đủ 100% các trường nghiệp vụ theo SRS v5.2.
 * 3. Safe Defaults: Trường nào Backend chưa có hoặc thiếu thì gán giá trị mặc định an toàn đúng kiểu (null, 0, [], {}, "").
 */

// 5 Ngành hàng cốt lõi chuẩn SRS v5.2 (Hằng số nghiệp vụ, không phải mock data)
export const CORE_CATEGORIES = [
  { id: 1, categoryId: 1, slug: 'ti-vi', name: 'Ti vi', shortName: 'Ti vi', icon: 'tv', parentId: null, brands: ['Sony', 'Samsung', 'LG', 'Casper'], displayOrder: 1, isActive: true },
  { id: 2, categoryId: 2, slug: 'dieu-hoa', name: 'Điều hòa', shortName: 'Điều hòa', icon: 'wind', parentId: null, brands: ['Daikin', 'Panasonic', 'Casper'], displayOrder: 2, isActive: true },
  { id: 3, categoryId: 3, slug: 'tu-lanh', name: 'Tủ lạnh', shortName: 'Tủ lạnh', icon: 'snowflake', parentId: null, brands: ['Aqua', 'Samsung', 'Toshiba'], displayOrder: 3, isActive: true },
  { id: 4, categoryId: 4, slug: 'quat', name: 'Quạt', shortName: 'Quạt', icon: 'fan', parentId: null, brands: ['Senko', 'Panasonic', 'Sunhouse'], displayOrder: 4, isActive: true },
  { id: 5, categoryId: 5, slug: 'noi-com-dien', name: 'Nồi cơm điện', shortName: 'Nồi cơm điện', icon: 'utensils-crossed', parentId: null, brands: ['Cuckoo', 'Toshiba', 'Sunhouse'], displayOrder: 5, isActive: true },
  // Nhóm con Ti vi
  { id: 6, categoryId: 6, slug: 'smart-tivi-4k', name: 'Smart Tivi 4K', shortName: 'Tivi 4K', icon: 'tv', parentId: 1, brands: ['Sony', 'Samsung', 'LG'], displayOrder: 6, isActive: true },
  { id: 7, categoryId: 7, slug: 'tivi-oled-qled', name: 'Tivi OLED & QLED', shortName: 'Tivi OLED', icon: 'tv', parentId: 1, brands: ['Sony', 'Samsung', 'LG'], displayOrder: 7, isActive: true },
  // Nhóm con Điều hòa
  { id: 8, categoryId: 8, slug: 'dieu-hoa-1-chieu', name: 'Điều hòa 1 chiều Inverter', shortName: 'ĐH 1 chiều', icon: 'wind', parentId: 2, brands: ['Daikin', 'Panasonic', 'Casper'], displayOrder: 8, isActive: true },
  { id: 9, categoryId: 9, slug: 'dieu-hoa-2-chieu', name: 'Điều hòa 2 chiều Inverter', shortName: 'ĐH 2 chiều', icon: 'wind', parentId: 2, brands: ['Daikin', 'Panasonic'], displayOrder: 9, isActive: true },
  // Nhóm con Tủ lạnh
  { id: 10, categoryId: 10, slug: 'tu-lanh-ngan-da-tren', name: 'Tủ lạnh Ngăn đá trên', shortName: 'Ngăn đá trên', icon: 'snowflake', parentId: 3, brands: ['Aqua', 'Samsung', 'Toshiba'], displayOrder: 10, isActive: true },
  { id: 11, categoryId: 11, slug: 'tu-lanh-side-by-side', name: 'Tủ lạnh Side by Side', shortName: 'Side by Side', icon: 'snowflake', parentId: 3, brands: ['Samsung', 'Aqua'], displayOrder: 11, isActive: true },
  { id: 12, categoryId: 12, slug: 'tu-lanh-mini', name: 'Tủ lạnh Mini', shortName: 'Tủ lạnh Mini', icon: 'snowflake', parentId: 3, brands: ['Aqua'], displayOrder: 12, isActive: true },
  // Nhóm con Quạt
  { id: 13, categoryId: 13, slug: 'quat-dung', name: 'Quạt đứng & Quạt cây', shortName: 'Quạt đứng', icon: 'fan', parentId: 4, brands: ['Senko', 'Panasonic', 'Sunhouse'], displayOrder: 13, isActive: true },
  { id: 14, categoryId: 14, slug: 'quat-treo-tuong', name: 'Quạt treo tường', shortName: 'Quạt treo', icon: 'fan', parentId: 4, brands: ['Senko', 'Panasonic'], displayOrder: 14, isActive: true },
  { id: 15, categoryId: 15, slug: 'quat-dieu-hoa', name: 'Quạt điều hòa hơi nước', shortName: 'Quạt điều hòa', icon: 'fan', parentId: 4, brands: ['Sunhouse'], displayOrder: 15, isActive: true },
  // Nhóm con Nồi cơm điện
  { id: 16, categoryId: 16, slug: 'noi-com-dien-tu', name: 'Nồi cơm điện tử', shortName: 'Điện tử', icon: 'utensils-crossed', parentId: 5, brands: ['Cuckoo', 'Toshiba'], displayOrder: 16, isActive: true },
  { id: 17, categoryId: 17, slug: 'noi-com-cao-tan', name: 'Nồi cơm cao tần (IH)', shortName: 'Cao tần IH', icon: 'utensils-crossed', parentId: 5, brands: ['Cuckoo', 'Toshiba'], displayOrder: 17, isActive: true },
  { id: 18, categoryId: 18, slug: 'noi-com-dien-co', name: 'Nồi cơm điện cơ', shortName: 'Điện cơ', icon: 'utensils-crossed', parentId: 5, brands: ['Sunhouse', 'Cuckoo'], displayOrder: 18, isActive: true }
];

export const ALL_BRANDS = ['Sony', 'Samsung', 'LG', 'Daikin', 'Panasonic', 'Casper', 'Aqua', 'Toshiba', 'Senko', 'Cuckoo', 'Sunhouse'];

/**
 * 1. Danh mục sản phẩm (Category Schema) - FR-02, SCR-01
 */
export function createCategorySchema(data = {}) {
  const id = data.id ?? data.categoryId ?? null;
  return {
    id: id !== null ? Number(id) : null,
    categoryId: id !== null ? Number(id) : null,
    name: String(data.name || ''),
    shortName: String(data.shortName || data.name || ''),
    slug: String(data.slug || ''),
    icon: String(data.icon || 'tag'),
    description: String(data.description || ''),
    parentId: data.parentId !== undefined ? (data.parentId !== null ? Number(data.parentId) : null) : null,
    displayOrder: Number(data.displayOrder || 0),
    brands: Array.isArray(data.brands) ? [...data.brands] : [],
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
  };
}

/**
 * 2. Sản phẩm & Biến thể (Product & ProductVariant Schema) - FR-02, FR-03, FR-08, DAT-01
 */
export function createProductVariantSchema(data = {}) {
  const price = Number(data.price ?? data.salePrice ?? 0);
  const originalPrice = Number(data.originalPrice ?? data.listPrice ?? price);
  return {
    id: data.id !== undefined && data.id !== null ? String(data.id) : (data.variantId ? String(data.variantId) : ''),
    variantId: data.variantId !== undefined && data.variantId !== null ? String(data.variantId) : (data.id ? String(data.id) : ''),
    sku: String(data.sku || ''),
    name: String(data.name || data.variantName || 'Tiêu chuẩn'),
    price: price >= 0 ? price : 0,
    originalPrice: originalPrice >= price ? originalPrice : price,
    stockQty: Number(data.stockQty ?? data.stockQuantity ?? data.stock ?? 0),
    attributes: typeof data.attributes === 'object' && data.attributes !== null ? { ...data.attributes } : {}
  };
}

export function createProductSchema(data = {}) {
  const id = data.id ?? data.productId ?? null;
  const rawPrice = data.price ?? data.salePrice;
  const price = rawPrice !== undefined && rawPrice !== null && Number(rawPrice) > 0 ? Number(rawPrice) : 0;
  const rawOrigPrice = data.originalPrice ?? data.listPrice;
  let originalPrice = rawOrigPrice !== undefined && rawOrigPrice !== null && Number(rawOrigPrice) > 0 ? Number(rawOrigPrice) : price;
  if (originalPrice < price) originalPrice = price;

  const discountPercent = (originalPrice > price && originalPrice > 0)
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : Number(data.discountPercent || 0);

  const categoryId = data.categoryId ?? data.category?.categoryId ?? data.category?.id ?? null;
  const matchedCoreCat = CORE_CATEGORIES.find(c => c.id === Number(categoryId));

  // Chuẩn hóa biến thể
  const rawVariants = Array.isArray(data.variants) ? data.variants : [];
  const variants = rawVariants.map(v => createProductVariantSchema(v));

  // Chuẩn hóa thư viện ảnh
  const images = Array.isArray(data.images)
    ? [...data.images]
    : (data.imageUrl ? [data.imageUrl] : (data.thumbnail ? [data.thumbnail] : []));

  const thumbnail = String(data.thumbnail || (images.length > 0 ? images[0] : ''));

  return {
    id: id !== null ? (typeof id === 'number' ? id : (isNaN(Number(id)) ? id : Number(id))) : null,
    productId: id !== null ? (typeof id === 'number' ? id : (isNaN(Number(id)) ? id : Number(id))) : null,
    sku: String(data.sku || (id ? `SKU-${id}` : '')),
    name: String(data.name || data.productName || ''),
    slug: String(data.slug || ''),
    categoryId: categoryId !== null ? Number(categoryId) : (matchedCoreCat ? matchedCoreCat.id : null),
    categoryName: String(data.categoryName || data.category?.name || matchedCoreCat?.name || ''),
    brand: String(data.brand || data.manufacturer || 'Khác'),
    origin: String(data.origin || 'Chính hãng'),
    releaseYear: data.releaseYear ? Number(data.releaseYear) : null,
    warrantyMonths: Number.isInteger(data.warrantyMonths) ? data.warrantyMonths : 24,
    shortDescription: String(data.shortDescription || ''),
    description: String(data.description || data.fullDescription || ''),
    technicalSpecs: typeof data.technicalSpecs === 'object' && data.technicalSpecs !== null
      ? { ...data.technicalSpecs }
      : (typeof data.specifications === 'object' && data.specifications !== null ? { ...data.specifications } : {}),
    price,
    originalPrice,
    discountPercent,
    stockQty: Number(data.stockQty ?? data.stockQuantity ?? data.stock ?? 0),
    thumbnail,
    images,
    variants,
    isVisible: data.isVisible !== undefined ? (data.isVisible !== false) : true,
    trackSerial: data.trackSerial !== undefined ? Boolean(data.trackSerial) : false,
    ratingAverage: Number(data.ratingAverage || 5.0),
    reviewCount: Number(data.reviewCount || 0),
    isFeatured: Boolean(data.isFeatured || false),
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

/**
 * 3. Giỏ hàng & Mục giỏ hàng (Cart & CartItem Schema) - FR-04, UC-04, Bảng 18 SRS
 */
export function createCartItemSchema(data = {}) {
  const price = Number(data.price || 0);
  const qty = Number(data.quantity || data.qty || 1);
  return {
    id: String(data.id || data.variantId || data.productId || ''),
    productId: data.productId ? (isNaN(Number(data.productId)) ? data.productId : Number(data.productId)) : null,
    variantId: String(data.variantId || ''),
    productName: String(data.productName || data.name || ''),
    variantName: String(data.variantName || 'Tiêu chuẩn'),
    price,
    originalPrice: Number(data.originalPrice || price),
    quantity: qty > 0 ? qty : 1,
    subtotal: price * (qty > 0 ? qty : 1),
    thumbnail: String(data.thumbnail || data.image || ''),
    stockQty: Number(data.stockQty ?? 999),
    trackSerial: Boolean(data.trackSerial)
  };
}

/**
 * 4. Đơn hàng & Thanh toán (Order Schema) - FR-05, FR-06, FR-07, BR-01, BR-02, BR-11
 */
export function createOrderSchema(data = {}) {
  const items = Array.isArray(data.items) ? data.items.map(it => createCartItemSchema(it)) : [];
  const subtotal = data.subtotal !== undefined
    ? Number(data.subtotal)
    : items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = Number(data.shippingFee || 0);
  const discountAmount = Number(data.discountAmount || 0);
  const totalAmount = data.totalAmount !== undefined
    ? Number(data.totalAmount)
    : Math.max(0, subtotal + shippingFee - discountAmount);

  return {
    id: data.id !== undefined && data.id !== null ? String(data.id) : '',
    orderCode: String(data.orderCode || (data.id ? `PH-${data.id}` : '')),
    userId: data.userId !== undefined ? data.userId : null,
    customerName: String(data.customerName || data.fullName || ''),
    customerPhone: String(data.customerPhone || data.phone || ''),
    customerEmail: String(data.customerEmail || data.email || ''),
    shippingAddress: typeof data.shippingAddress === 'string'
      ? data.shippingAddress
      : String(data.shippingAddress?.street || data.address || ''),
    province: String(data.province || ''),
    district: String(data.district || ''),
    ward: String(data.ward || ''),
    paymentMethod: String(data.paymentMethod || 'COD'), // COD | VIETQR | VNPAY | INSTALLMENT_0
    paymentStatus: String(data.paymentStatus || 'UNPAID'), // UNPAID | PAID | REFUNDED
    orderStatus: String(data.orderStatus || data.status || 'PENDING'), // PENDING | CONFIRMED | SHIPPING | COMPLETED | CANCELLED
    items,
    subtotal,
    shippingFee,
    discountAmount,
    couponCode: data.couponCode ? String(data.couponCode) : null,
    totalAmount,
    serialNumbers: Array.isArray(data.serialNumbers) ? [...data.serialNumbers] : (data.serialNo ? [data.serialNo] : []),
    note: String(data.note || ''),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

/**
 * 5. Hồ sơ bảo hành điện tử (Warranty Schema) - FR-12, UC-12, Wireframe Hình 14
 */
export function createWarrantySchema(data = {}) {
  return {
    id: data.id !== undefined && data.id !== null ? String(data.id) : '',
    warrantyCode: String(data.warrantyCode || (data.serialNumber || data.serialNo ? `BH-${data.serialNumber || data.serialNo}` : '')),
    serialNumber: String(data.serialNumber || data.serialNo || ''),
    serialNo: String(data.serialNo || data.serialNumber || ''),
    orderId: data.orderId !== undefined && data.orderId !== null ? String(data.orderId) : '',
    orderCode: String(data.orderCode || (data.orderId ? `PH-${data.orderId}` : '')),
    productId: data.productId ? (isNaN(Number(data.productId)) ? data.productId : Number(data.productId)) : null,
    productName: String(data.productName || ''),
    variantName: String(data.variantName || 'Tiêu chuẩn'),
    customerName: String(data.customerName || ''),
    customerPhone: String(data.customerPhone || data.phone || ''),
    purchaseDate: data.purchaseDate || null,
    activationDate: data.activationDate || null,
    expirationDate: data.expirationDate || data.warrantyExpiryDate || null,
    warrantyExpiryDate: data.warrantyExpiryDate || data.expirationDate || null,
    warrantyMonths: Number(data.warrantyMonths || 24),
    status: String(data.status || 'ACTIVE'), // ACTIVE | EXPIRED | VOID
    showroomAddress: String(data.showroomAddress || 'Xóm 8, Đường Đình Xuyên, Gia Lâm, Hà Nội'),
    claimHistory: Array.isArray(data.claimHistory) ? [...data.claimHistory] : [],
    createdAt: data.createdAt || new Date().toISOString()
  };
}

/**
 * 6. Người dùng & Phân quyền (User Schema) - FR-01, FR-11, DEC-001, Nghị định 13/2023/NĐ-CP
 */
export function createUserSchema(data = {}) {
  const rawRole = String(data.role || 'CUSTOMER').toUpperCase();
  let role = 'CUSTOMER';
  if (rawRole.includes('ADMIN')) role = 'ADMIN';
  else if (rawRole.includes('STAFF')) role = 'STAFF';

  return {
    id: data.id !== undefined && data.id !== null ? (isNaN(Number(data.id)) ? data.id : Number(data.id)) : null,
    fullName: String(data.fullName || data.name || ''),
    email: String(data.email || ''),
    phone: String(data.phone || ''),
    role, // CUSTOMER | STAFF | ADMIN
    address: String(data.address || ''),
    agreedPrivacyPolicy: Boolean(data.agreedPrivacyPolicy || data.agreePrivacy),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : (data.status ? data.status === 'ACTIVE' : true),
    createdAt: data.createdAt || null
  };
}

/**
 * 7. Mã khuyến mãi / Voucher (Coupon Schema) - FR-09, UC-09, BR-04
 */
export function createCouponSchema(data = {}) {
  return {
    id: data.id !== undefined && data.id !== null ? String(data.id) : '',
    code: String(data.code || '').toUpperCase().trim(),
    title: String(data.title || `Voucher ${data.code || ''}`),
    discountType: String(data.discountType || 'AMOUNT'), // AMOUNT | PERCENT
    discountValue: Number(data.discountValue || 0),
    minOrderValue: Number(data.minOrderValue || 0),
    maxDiscount: Number(data.maxDiscount || 0),
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    usageLimit: Number(data.usageLimit || 1000),
    usedCount: Number(data.usedCount || 0),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
  };
}
