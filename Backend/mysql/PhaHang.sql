-- Pha Hang e-commerce database (17 tables)
-- MySQL 8.0+, intended for Spring Boot / JPA backend
-- 12 SRS core tables + 5 backend warehouse/serial extensions
CREATE DATABASE IF NOT EXISTS phahang_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phahang_db;

-- 1. USERS
CREATE TABLE users (
  user_id BIGINT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER','STAFF','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_phone (phone)
) ENGINE=InnoDB;


-- 2. CATEGORIES (two-level tree via parent_id)
CREATE TABLE categories (
  category_id BIGINT NOT NULL AUTO_INCREMENT,
  parent_id BIGINT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id),
  UNIQUE KEY uk_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(category_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 3. PRODUCTS
CREATE TABLE products (
  product_id BIGINT NOT NULL AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  brand VARCHAR(100) NULL,
  description TEXT NULL,
  warranty_months INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  KEY idx_products_category (category_id),
  KEY idx_products_name (name),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_products_warranty CHECK (warranty_months BETWEEN 0 AND 60)
) ENGINE=InnoDB;


-- 4. PRODUCT_VARIANTS
CREATE TABLE product_variants (
  variant_id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sku VARCHAR(100) NOT NULL,
  variant_name VARCHAR(150) NULL,
  specification JSON NULL,
  color VARCHAR(50) NULL,
  price DECIMAL(15,2) NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  track_serial BOOLEAN NOT NULL DEFAULT FALSE,
  warranty_months INT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (variant_id),
  UNIQUE KEY uk_variants_sku (sku),
  KEY idx_variants_product (product_id),
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_variants_price CHECK (price >= 0),
  CONSTRAINT chk_variants_stock CHECK (stock_qty >= 0),
  CONSTRAINT chk_variants_warranty CHECK (warranty_months IS NULL OR warranty_months BETWEEN 0 AND 60)
) ENGINE=InnoDB;


-- 5. PRODUCT_IMAGES (the max-5-images rule is enforced in application/service logic)
CREATE TABLE product_images (
  image_id BIGINT NOT NULL AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (image_id),
  KEY idx_product_images_product_sort (product_id, sort_order),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_image_sort_order CHECK (sort_order >= 0)
) ENGINE=InnoDB;


-- 6. CART_ITEMS
CREATE TABLE cart_items (
  cart_item_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cart_item_id),
  UNIQUE KEY uk_cart_user_variant (user_id, variant_id),
  KEY idx_cart_variant (variant_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cart_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_cart_quantity CHECK (quantity >= 1)
) ENGINE=InnoDB;


-- 7. ADDRESSES
CREATE TABLE addresses (
  address_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  receiver_name VARCHAR(100) NOT NULL,
  receiver_phone VARCHAR(15) NOT NULL,
  province VARCHAR(100) NULL,
  district VARCHAR(100) NULL,
  ward VARCHAR(100) NULL,
  address_detail VARCHAR(255) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (address_id),
  KEY idx_addresses_user (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 8. COUPONS
CREATE TABLE coupons (
  coupon_id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  discount_type ENUM('PERCENT','FIXED') NOT NULL,
  discount_value DECIMAL(15,2) NOT NULL,
  min_order_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(15,2) NULL,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (coupon_id),
  UNIQUE KEY uk_coupons_code (code),
  CONSTRAINT chk_coupon_value CHECK (discount_value > 0),
  CONSTRAINT chk_coupon_min_order CHECK (min_order_amount >= 0),
  CONSTRAINT chk_coupon_max_discount CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0),
  CONSTRAINT chk_coupon_usage_limit CHECK (usage_limit IS NULL OR usage_limit >= 0),
  CONSTRAINT chk_coupon_used_count CHECK (used_count >= 0),
  CONSTRAINT chk_coupon_dates CHECK (end_at >= start_at),
  CONSTRAINT chk_coupon_percent CHECK (discount_type <> 'PERCENT' OR discount_value <= 100)
) ENGINE=InnoDB;


-- 9. ORDERS
CREATE TABLE orders (
  order_id BIGINT NOT NULL AUTO_INCREMENT,
  order_code VARCHAR(30) NOT NULL,
  user_id BIGINT NOT NULL,
  address_id BIGINT NULL,
  coupon_id BIGINT NULL,
  receiver_name VARCHAR(100) NOT NULL,
  receiver_phone VARCHAR(15) NOT NULL,
  shipping_address VARCHAR(500) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  payment_method ENUM('COD','BANK_TRANSFER') NOT NULL,
  status ENUM('PENDING_CONFIRMATION','CONFIRMED','SHIPPING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING_CONFIRMATION',
  note TEXT NULL,
  confirmed_by BIGINT NULL,
  confirmed_at DATETIME NULL,
  completed_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  cancel_reason VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  UNIQUE KEY uk_orders_code (order_code),
  KEY idx_orders_user_created (user_id, created_at),
  KEY idx_orders_status_created (status, created_at),
  KEY idx_orders_coupon (coupon_id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(address_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_orders_confirmed_by FOREIGN KEY (confirmed_by) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0),
  CONSTRAINT chk_orders_discount CHECK (discount_amount >= 0),
  CONSTRAINT chk_orders_total CHECK (total_amount >= 0 AND total_amount <= subtotal)
) ENGINE=InnoDB;


-- 10. ORDER_ITEMS
CREATE TABLE order_items (
  order_item_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  product_name_snapshot VARCHAR(200) NOT NULL,
  sku_snapshot VARCHAR(100) NOT NULL,
  variant_snapshot VARCHAR(255) NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_item_id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_variant (variant_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_order_item_price CHECK (unit_price >= 0),
  CONSTRAINT chk_order_item_quantity CHECK (quantity >= 1),
  CONSTRAINT chk_order_item_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB;


-- 11. PAYMENTS (one payment record per order in the initial implementation)
CREATE TABLE payments (
  payment_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  payment_method ENUM('COD','BANK_TRANSFER') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('UNPAID','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  transaction_code VARCHAR(100) NULL,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  UNIQUE KEY uk_payments_order (order_id),
  KEY idx_payments_status_paid (status, paid_at),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_payments_amount CHECK (amount >= 0)
) ENGINE=InnoDB;


-- 12. WARRANTIES
-- A warranty is attached to an order line; serial_id is optional for non-serial products.
CREATE TABLE warranties (
  warranty_id BIGINT NOT NULL AUTO_INCREMENT,
  order_item_id BIGINT NOT NULL,
  serial_id BIGINT NULL,
  customer_id BIGINT NOT NULL,
  warranty_code VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('ACTIVE','EXPIRED','VOID') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (warranty_id),
  UNIQUE KEY uk_warranty_order_item (order_item_id),
  UNIQUE KEY uk_warranty_serial (serial_id),
  UNIQUE KEY uk_warranty_code (warranty_code),
  KEY idx_warranties_customer (customer_id),
  KEY idx_warranties_dates (end_date, status),
  CONSTRAINT fk_warranties_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_warranties_customer FOREIGN KEY (customer_id) REFERENCES users(user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_warranty_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;


-- 13. SUPPLIERS (backend extension; supplier purchase management is out of SRS V1 scope)
CREATE TABLE suppliers (
  supplier_id BIGINT NOT NULL AUTO_INCREMENT,
  supplier_name VARCHAR(150) NOT NULL,
  phone VARCHAR(15) NULL,
  email VARCHAR(150) NULL,
  address VARCHAR(500) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id),
  KEY idx_suppliers_name (supplier_name)
) ENGINE=InnoDB;


-- 14. STOCK_RECEIPTS
CREATE TABLE stock_receipts (
  receipt_id BIGINT NOT NULL AUTO_INCREMENT,
  receipt_code VARCHAR(30) NOT NULL,
  supplier_id BIGINT NULL,
  created_by BIGINT NOT NULL,
  receipt_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status ENUM('DRAFT','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (receipt_id),
  UNIQUE KEY uk_stock_receipts_code (receipt_code),
  KEY idx_stock_receipts_date (receipt_date),
  CONSTRAINT fk_stock_receipts_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_stock_receipts_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_stock_receipts_total CHECK (total_amount >= 0)
) ENGINE=InnoDB;


-- 15. STOCK_RECEIPT_ITEMS
CREATE TABLE stock_receipt_items (
  receipt_item_id BIGINT NOT NULL AUTO_INCREMENT,
  receipt_id BIGINT NOT NULL,
  variant_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (receipt_item_id),
  KEY idx_receipt_items_receipt (receipt_id),
  KEY idx_receipt_items_variant (variant_id),
  CONSTRAINT fk_receipt_items_receipt FOREIGN KEY (receipt_id) REFERENCES stock_receipts(receipt_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_receipt_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_receipt_item_quantity CHECK (quantity >= 1),
  CONSTRAINT chk_receipt_item_cost CHECK (unit_cost >= 0),
  CONSTRAINT chk_receipt_item_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB;


-- 16. INVENTORY_TRANSACTIONS (append-only stock audit log; do not delete historical rows)
CREATE TABLE inventory_transactions (
  transaction_id BIGINT NOT NULL AUTO_INCREMENT,
  variant_id BIGINT NOT NULL,
  receipt_item_id BIGINT NULL,
  order_item_id BIGINT NULL,
  created_by BIGINT NULL,
  transaction_type ENUM('IMPORT','EXPORT','RETURN','ADJUSTMENT_PLUS','ADJUSTMENT_MINUS','CANCEL_EXPORT') NOT NULL,
  quantity INT NOT NULL,
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  note VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (transaction_id),
  KEY idx_inventory_variant_created (variant_id, created_at),
  KEY idx_inventory_receipt_item (receipt_item_id),
  KEY idx_inventory_order_item (order_item_id),
  CONSTRAINT fk_inventory_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_receipt_item FOREIGN KEY (receipt_item_id) REFERENCES stock_receipt_items(receipt_item_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_creator FOREIGN KEY (created_by) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_inventory_quantity CHECK (quantity >= 1),
  CONSTRAINT chk_inventory_stock_before CHECK (stock_before >= 0),
  CONSTRAINT chk_inventory_stock_after CHECK (stock_after >= 0)
) ENGINE=InnoDB;


-- 17. SERIAL_NUMBERS (one row per physical serial-tracked unit)
CREATE TABLE serial_numbers (
  serial_id BIGINT NOT NULL AUTO_INCREMENT,
  variant_id BIGINT NOT NULL,
  receipt_item_id BIGINT NULL,
  order_item_id BIGINT NULL,
  serial_no VARCHAR(100) NOT NULL,
  status ENUM('IN_STOCK','RESERVED','SOLD','RETURNED','DEFECTIVE','WARRANTY') NOT NULL DEFAULT 'IN_STOCK',
  warehouse_location VARCHAR(100) NULL,
  imported_at DATETIME NULL,
  exported_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (serial_id),
  UNIQUE KEY uk_serial_no (serial_no),
  UNIQUE KEY uk_serial_order_item (order_item_id),
  KEY idx_serial_variant_status (variant_id, status),
  KEY idx_serial_receipt_item (receipt_item_id),
  CONSTRAINT fk_serial_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_serial_receipt_item FOREIGN KEY (receipt_item_id) REFERENCES stock_receipt_items(receipt_item_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_serial_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;


-- NOTE: The warranties table FK references serial_numbers, so it is created above before serial_numbers.
-- To resolve creation order on a fresh database, add that FK after serial_numbers exists.
ALTER TABLE warranties
  ADD CONSTRAINT fk_warranties_serial FOREIGN KEY (serial_id) REFERENCES serial_numbers(serial_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;
