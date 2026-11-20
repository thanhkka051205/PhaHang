# HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ BÁN LẺ ĐIỆN MÁY PHA HẰNG
## BÁO CÁO PHÂN TÍCH KHOẢNG TRỐNG TÍNH NĂNG (GAP ANALYSIS REPORT)
**Đối Chiếu Hiện Trạng Backend (Spring Boot 3) Với Tài Liệu Yêu Cầu Nghiệp Vụ SRS v5.2**

---

### THÔNG TIN HÀNH CHÍNH
- **Dự án:** Website Bán Lẻ Điện Máy Pha Hằng (Gia Dụng & Điện Lạnh - 5 Ngành hàng).
- **Mã nguồn Backend đối chiếu:** [thanhkka051205/PhaHang](https://github.com/thanhkka051205/PhaHang) (Spring Boot 3 + MySQL).
- **Tài liệu SRS đối chiếu:** `SRS_Website_TBDT.docx` & `Tong_Hop_Cac_Man_Hinh_Website_Dien_May_Pha_Hang_SRS.docx` (v5.2).
- **Ngày lập báo cáo:** 12/11/2026.
- **Đánh giá tổng quan:** Backend hiện mới hoàn thiện khoảng **35%** yêu cầu nghiệp vụ của SRS. Toàn bộ các phân hệ trọng yếu gồm Giỏ hàng, Đơn hàng, Thanh toán, Bảo hành điện tử và Thống kê doanh thu đang ở trạng thái **RỖNG** (chưa có code Controller, Service, Repository).

---

## I. MA TRẬN ĐỐI CHIẾU 12 USE CASES THEO SRS

| Mã UC | Tên Chức Năng (Use Case) | Hiện Trạng Backend Spring Boot | Mức Hoàn Thành | Đánh Giá Thiếu Hụt |
| :--- | :--- | :--- | :---: | :--- |
| **UC-01** | Đăng ký tài khoản khách hàng | Đã có `POST /api/auth/register` (gán ROLE_CUSTOM). FE đã kết nối thật và ghi nhận cờ đồng thuận Nghị định 13 | **90%** | Thấp (Low) |
| **UC-02** | Đăng nhập hệ thống (JWT) | Đã có `POST /api/auth/login` trả `ResLoginDTO` nhúng user info và token. Đã cấu hình `CorsConfig` | **100%** | Hoàn thành |
| **UC-03** | Xem & Tìm kiếm sản phẩm, danh mục | Đã có CRUD Categories, Products; **DTO thiếu price, images, variants** -> FE hiển thị nhãn Gap State | **60%** | Cao (High) |
| **UC-04** | Quản lý giỏ hàng mua sắm | `CartItemController` **RỖNG HOÀN TOÀN**; FE tuân thủ Zero-Mock, hiển thị Banner chờ Backend | **0%** | **Nghiêm trọng (Critical)** |
| **UC-05** | Đặt hàng & Thanh toán (COD/VietQR) | `OrderController`, `PaymentController` **RỖNG**; FE tuân thủ Zero-Mock, hiển thị Banner chờ Backend | **0%** | **Nghiêm trọng (Critical)** |
| **UC-06** | Xem lịch sử đơn & Hủy đơn | `OrderController` **RỖNG**; Chưa có API `/orders/my-orders`, `/orders/lookup`. FE hiển thị Banner chờ Backend | **0%** | **Nghiêm trọng (Critical)** |
| **UC-07** | Quản lý & Duyệt đơn hàng (Admin) | Chưa có API duyệt đơn, chuyển trạng thái và **GÁN SỐ SERI xuất kho** (FR-07.5, BR-11) | **0%** | **Nghiêm trọng (Critical)** |
| **UC-08** | Quản lý sản phẩm & Kho (Admin) | Đã có CRUD Products; Thiếu CRUD Biến thể (`ProductVariantController` rỗng), thiếu ảnh | **50%** | Cao (High) |
| **UC-09** | Quản lý khuyến mãi / Voucher | `CouponController` **RỖNG HOÀN TOÀN**; FE tuân thủ Zero-Mock, hiển thị Banner chờ Backend | **0%** | Cao (High) |
| **UC-10** | Báo cáo doanh thu Dashboard | Chưa có Controller Dashboard; FE tuân thủ Zero-Mock, hiển thị Banner chờ Backend | **0%** | Cao (High) |
| **UC-11** | Quản lý người dùng & Phân quyền | Đã có CRUD Users, đổi quyền role `/users/{id}/role` (Admin/Staff/Customer); FE kết nối API thật | **95%** | Rất thấp (Very Low) |
| **UC-12** | Tra cứu & Kích hoạt bảo hành điện tử | `WarrantyController` **RỖNG HOÀN TOÀN**; FE tuân thủ Zero-Mock, hiển thị Banner chờ Backend | **0%** | **Nghiêm trọng (Critical)** |

---

## II. CHI TIẾT CÁC PHÂN HỆ BACKEND ĐANG THIẾU SO VỚI SRS

### 1. Phân Hệ Quản Lý Sản Phẩm & Biến Thể (FR-02, FR-03, FR-08, DAT-01)
- **Hiện trạng:** Đã có `ProductController` (`GET /api/products`, `GET /api/products/{id}`, `POST`, `PUT`, `DELETE`, `/search`, `/filter`).
- **Khoảng trống thiếu hụt:**
  1. `ProductResponseDTO` chưa trả về giá bán (`price`) và danh sách hình ảnh (`images`). Mặc dù trong database có entity `ProductVariant` và `ProductImage` nhưng DTO trả về cho Client bị thiếu hoàn toàn 2 trường này, khiến Frontend không thể hiển thị giá tiền và ảnh đại diện thật từ Backend.
  2. `ProductVariantController` rỗng: Không có API quản lý các phiên bản cấu hình theo Wireframe Hình 12 SRS (kích thước màn hình inch tivi, công suất BTU điều hòa, dung tích lít tủ lạnh).
  3. `ProductImageController` rỗng: Chưa có API upload và quản lý thư viện ảnh thiết bị.
  4. Chưa kiểm tra ràng buộc toàn vẹn tồn kho không âm `stockQty >= 0` (DAT-01).

### 2. Phân Hệ Giỏ Hàng Mua Sắm (FR-04, UC-04, Bảng 18 SRS)
- **Hiện trạng:** Đã có Entity `CartItem` trong Domain.
- **Khoảng trống thiếu hụt:**
  - Class `CarItemController.java` rỗng 100%, chưa có Service và Repository.
  - Cần bổ sung các Endpoints:
    + `GET /api/cart`: Lấy danh sách sản phẩm trong giỏ của tài khoản.
    + `POST /api/cart`: Thêm sản phẩm vào giỏ (kiểm tra không vượt tồn kho DAT-01).
    + `PUT /api/cart/{cartItemId}`: Cập nhật số lượng (+ / -).
    + `DELETE /api/cart/{cartItemId}`: Xóa sản phẩm khỏi giỏ.
    + `DELETE /api/cart`: Làm trống toàn bộ giỏ hàng.

### 3. Phân Hệ Đặt Hàng & Thanh Toán (FR-05, UC-05, BR-01, BR-02)
- **Hiện trạng:** Đã có Entity `Order`, `OrderItem`, `Payment`.
- **Khoảng trống thiếu hụt:**
  - Cả 3 controller `OrderController.java`, `OrderItemController.java`, `PaymentController.java` đều rỗng.
  - Cần bổ sung:
    + `POST /api/orders`: Tạo đơn hàng mới từ giỏ hàng (lưu snapshot địa chỉ giao hàng, SĐT, tổng tiền).
    + Luồng thanh toán COD và chuyển khoản VietQR tự động.
    + Logic chuyển đổi trạng thái đơn hàng (BR-01, BR-02): `PENDING` -> `SHIPPING` -> `COMPLETED` / `CANCELLED`.

### 4. Phân Hệ Tra Cứu & Quản Trị Đơn Hàng (FR-06, FR-07, BR-05, BR-11, Wireframe Hình 13)
- **Khoảng trống thiếu hụt:**
  - `GET /api/orders/my-orders`: Khách hàng xem lịch sử đơn hàng cá nhân (DEC-001).
  - `POST /api/orders/lookup`: Tra cứu đơn hàng an toàn cho khách vãng lai (yêu cầu đúng Mã đơn + Số điện thoại, che mờ thông tin cá nhân PII theo Nghị định 13/2023/NĐ-CP).
  - `PUT /api/orders/{id}/cancel`: Khách tự hủy đơn khi đơn còn ở trạng thái Chờ xác nhận (PENDING) theo BR-05.
  - `GET /api/admin/orders`: Quản trị viên lọc và duyệt đơn hàng.
  - **Nghiệp vụ Gán Số Seri xuất kho (FR-07.5, BR-11, Wireframe Hình 13):** Bắt buộc nhân viên showroom phải nhập mã Số Seri (serialNo) cho Tivi, Điều hòa, Tủ lạnh trước khi bấm xuất kho giao hàng. Backend chưa có API này.

### 5. Phân Hệ Bảo Hành Điện Tử Chính Hãng (FR-12, UC-12, Wireframe Hình 14)
- **Khoảng trống thiếu hụt:**
  - `WarrantyController` rỗng 100%.
  - Cơ chế tự động kích hoạt bảo hành: Khi đơn hàng được gán Số Seri và chuyển sang Hoàn tất, Backend phải tự động sinh hồ sơ bảo hành 24 tháng vào bảng `WARRANTIES`.
  - `GET /api/warranties/lookup?query=`: Tra cứu bảo hành công khai bằng Số Seri hoặc Số điện thoại mua hàng (không bắt buộc đăng nhập theo Wireframe Hình 14).
  - `GET /api/admin/warranties`: Màn hình quản lý hồ sơ bảo hành cho kỹ thuật viên showroom Pha Hằng tại Gia Lâm.

### 6. Phân Hệ Quản Lý Mã Khuyến Mãi / Voucher (FR-09, UC-09, BR-04)
- **Khoảng trống thiếu hụt:**
  - `CouponController` rỗng 100%.
  - `POST /api/coupons/apply`: Kiểm tra mã giảm giá hợp lệ tại giỏ hàng (ngày hiệu lực, trạng thái, tính tiền giảm theo % hoặc ₫).
  - CRUD `/api/coupons`: Màn hình quản trị mã ưu đãi cho Admin (SCR-11).

### 7. Phân Hệ Thống Kê & Báo Cáo Doanh Thu Dashboard (FR-10, UC-10)
- **Khoảng trống thiếu hụt:**
  - Hoàn toàn chưa có Controller/Service phục vụ thống kê Dashboard.
  - Thiếu các số liệu KPI theo Mục 4.3 & Mục 11 SRS:
    + Doanh thu tổng hợp và đơn chờ duyệt.
    + Doanh thu chi tiết đóng góp từ 5 ngành hàng lớn (Ti vi, Điều hòa, Tủ lạnh, Quạt, Nồi cơm điện).
    + Top 5 sản phẩm bán chạy nhất.

### 8. Tuân Thủ Nghị Định 13/2023/NĐ-CP Về Bảo Vệ Dữ Liệu Cá Nhân
- Backend hiện tại chưa lưu vết cờ đồng thuận xử lý dữ liệu cá nhân (`agreedPrivacyPolicy`) khi người dùng đăng ký tài khoản mới theo yêu cầu bắt buộc tại Mục 8.1 của SRS.

---

## III. LỘ TRÌNH ĐỀ XUẤT HOÀN THIỆN BACKEND (ROADMAP)

| Giai Đoạn | Nội Dung Triển Khai Chi Tiết | Mức Ưu Tiên | Thời Gian Dự Kiến |
| :--- | :--- | :---: | :---: |
| **Giai đoạn 1** *(Cốt lõi thương mại)* | 1. Bổ sung `price`, `images`, `variants` vào `ProductResponseDTO`<br>2. Hoàn thiện `CartItemController` (thêm/sửa/xóa giỏ hàng)<br>3. Hoàn thiện `OrderController` & `PaymentController` (tạo đơn, thanh toán) | **P0 (Bắt buộc)** | 3 - 5 ngày |
| **Giai đoạn 2** *(Quy trình nghiệp vụ)* | 1. Nghiệp vụ Admin duyệt đơn & Gán Số Seri xuất kho (FR-07.5, BR-11)<br>2. Tự động kích hoạt Bảo hành điện tử và `WarrantyController`<br>3. Hoàn thiện `CouponController` (áp dụng mã giảm giá) | **P1 (Trọng yếu)** | 3 - 4 ngày |
| **Giai đoạn 3** *(Báo cáo & Hoàn thiện)* | 1. Xây dựng API Dashboard thống kê doanh thu 5 ngành hàng<br>2. Bổ sung trường đồng thuận Nghị định 13/2023/NĐ-CP vào User<br>3. Kiểm thử tích hợp toàn diện FE - BE | **P2 (Hoàn thiện)** | 2 - 3 ngày |
