CREATE DATABASE IF NOT EXISTS phahang_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phahang_db;

-- 1. Bảng USERS (Tài khoản người dùng)
CREATE TABLE USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER, STAFF, ADMIN
    status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Bảng ADDRESSES (Địa chỉ nhận hàng)
CREATE TABLE ADDRESSES (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(15) NOT NULL,
    address_detail VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Bảng COUPONS (Mã khuyến mãi)
CREATE TABLE COUPONS (
    coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL, -- PERCENT hoặc AMOUNT
    discount_value DECIMAL(12, 2) NOT NULL,
    min_order_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    usage_limit INT DEFAULT NULL,
    start_date DATETIME,
    end_date DATETIME,
    status BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 4. Bảng CATEGORIES (Danh mục sản phẩm 2 cấp)
CREATE TABLE CATEGORIES (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES CATEGORIES(category_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Bảng PRODUCTS (Sản phẩm)
CREATE TABLE PRODUCTS (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    warranty_months INT NOT NULL DEFAULT 0,
    track_serial BOOLEAN NOT NULL DEFAULT FALSE,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES CATEGORIES(category_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Bảng PRODUCT_IMAGES (Ảnh sản phẩm)
CREATE TABLE PRODUCT_IMAGES (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES PRODUCTS(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Bảng PRODUCT_VARIANTS (Biến thể sản phẩm & tồn kho)
CREATE TABLE PRODUCT_VARIANTS (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    spec VARCHAR(100),
    color VARCHAR(50),
    price DECIMAL(12, 2) NOT NULL,
    stock_qty INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 2,
    FOREIGN KEY (product_id) REFERENCES PRODUCTS(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Bảng CART_ITEMS (Giỏ hàng)
CREATE TABLE CART_ITEMS (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT uq_cart_user_variant UNIQUE (user_id, variant_id),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES PRODUCT_VARIANTS(variant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Bảng ORDERS (Đơn hàng)
CREATE TABLE ORDERS (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coupon_id INT DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- Chờ xác nhận, Đã xác nhận, Đang giao, Hoàn thành, Đã hủy
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(15) NOT NULL,
    ship_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (coupon_id) REFERENCES COUPONS(coupon_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. Bảng ORDER_ITEMS (Chi tiết đơn hàng)
CREATE TABLE ORDER_ITEMS (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    serial_no VARCHAR(20) UNIQUE DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES PRODUCT_VARIANTS(variant_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 11. Bảng PAYMENTS (Thanh toán)
CREATE TABLE PAYMENTS (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    method VARCHAR(50) NOT NULL, -- COD hoặc BANK
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- Chưa thanh toán hoặc Đã thanh toán
    paid_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Bảng WARRANTIES (Bảo hành)
CREATE TABLE WARRANTIES (
    warranty_id INT AUTO_INCREMENT PRIMARY KEY,
    order_item_id INT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- Còn hạn hoặc Hết hạn
    FOREIGN KEY (order_item_id) REFERENCES ORDER_ITEMS(order_item_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. INVENTORY_LOGS (Lịch sử biến động tồn kho)
CREATE TABLE INVENTORY_LOGS (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    order_id INT DEFAULT NULL,
    change_qty INT NOT NULL, -- số âm: trừ tồn, số dương: cộng tồn / nhập hàng
    reason VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES PRODUCT_VARIANTS(variant_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 14. PRODUCT_SERIALS (Lưu vết số seri - hỗ trợ ghi nhận cả seri tự tạo lúc giao hàng)
CREATE TABLE PRODUCT_SERIALS (
    serial_id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    order_item_id INT DEFAULT NULL,
    serial_no VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'SOLD', -- SOLD, IN_STOCK, DEFECTIVE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES PRODUCT_VARIANTS(variant_id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES ORDER_ITEMS(order_item_id) ON DELETE SET NULL
) ENGINE=InnoDB;