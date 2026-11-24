# Website Bán Thiết Bị Điện Tử & iPhone - Trung Thực Mobile (Frontend)

Mã dự án: **PROJ-TTM-WEB**  
Đặc tả yêu cầu: **SRS-V1.0.0** (`SRS_Website_Trung_Thuc_Mobile.docx`)  
Địa chỉ cửa hàng: **Số 92 Phố Ngô Xuân Quảng, Trâu Quỳ, Gia Lâm, Hà Nội** (Hotline/Zalo: 0981 523 966)

---

## 1. Công Nghệ & Kiến Trúc
- **Framework**: Vue 3.5+ (Composition API với `<script setup lang="ts">`) + Vite 6 + TypeScript.
- **Styling**: Hệ thống **SaaS Design System** với TailwindCSS và Design Tokens (`src/styles/tokens.css`):
  - Bảng màu hiện đại: Indigo & Neutral Slate.
  - Controls: Chiều cao tối thiểu 40px đạt chuẩn `UI-03`.
  - Hiệu ứng: Soft Elevation Shadow, viền bo 8px/12px chuẩn SaaS Dashboard & E-Commerce.
- **Quản lý trạng thái (State)**: Pinia stores (`auth`, `cart`, `ui`).
- **Điều hướng (Router)**: Vue Router 4 với Navigation Guards phân quyền theo vai trò (Khách hàng, Nhân viên, Quản trị viên).
- **Bộ icon**: Lucide Vue Next.
- **Tầng API linh hoạt (Dual Adapter Pattern)**:
  - **Mock Service Adapter**: Sử dụng dữ liệu mẫu phong phú lưu trong `localStorage`, hỗ trợ test trọn vẹn 100% chức năng ngay lập tức mà không cần backend.
  - **Real REST Service Adapter**: Kết nối trực tiếp vào Backend Spring Boot REST API qua Axios Interceptor và JWT Bearer Token.

---

## 2. Danh Sách Màn Hình (Tuân thủ 100% SRS V1.0.0)
| Mã SCR | Tên màn hình | Đối tượng | Mô tả & Chức năng |
|---|---|---|---|
| **SCR-01** | Trang chủ & Danh mục | Mọi người | Banner, thanh menu danh mục, thanh tìm kiếm, bộ lọc giá/loại/tình trạng máy, lưới sản phẩm, phân trang |
| **SCR-02** | Chi tiết sản phẩm | Mọi người | Gallery ảnh, chọn biến thể dung lượng/màu sắc, hiển thị % pin với máy cũ, giá & tồn kho thời gian thực, nút Thêm giỏ & Mua ngay |
| **SCR-03** | Đăng ký & Đăng nhập | Mọi người | Xác thực JWT, form validate tiếng Việt (UI-05), hỗ trợ đăng nhập nhanh Admin / Staff / Khách để thử nghiệm |
| **SCR-04** | Giỏ hàng | Khách hàng | Tăng/giảm số lượng kiểm tra tồn kho `stock_qty`, xóa món, tính tạm tính, chuyển sang đặt hàng |
| **SCR-05** | Đặt hàng & Thanh toán | Khách hàng | Nhập thông tin nhận hàng, áp dụng coupon giảm giá, chọn COD hoặc Chuyển khoản (có thông tin STK MB Bank) |
| **SCR-06** | Đơn hàng của tôi | Khách hàng | Danh sách đơn, chi tiết đơn, xem mã IMEI máy xuất kho, nút Hủy đơn cho đơn `Chờ xác nhận` (BR-05) có popup xác nhận |
| **SCR-07** | Quản lý đơn hàng | Staff, Admin | Danh sách đơn toàn hệ thống, chuyển trạng thái đơn (Xác nhận -> Giao hàng -> Hoàn thành), gán IMEI máy iPhone xuất kho (BR-03, BR-11) |
| **SCR-08** | Quản lý sản phẩm & Tồn kho | Staff, Admin | CRUD sản phẩm, thêm biến thể (dung lượng, màu, giá, tồn kho, pin), ẩn/hiện sản phẩm trên cửa hàng |
| **SCR-09** | Tra cứu bảo hành (IMEI) | Khách, Staff, Admin | Nhập mã IMEI 15 số -> Hiển thị tên máy, ngày mua, hạn bảo hành, trạng thái Còn hạn / Hết hạn |
| **SCR-10** | Quản lý khuyến mãi | Admin | CRUD mã giảm giá (% hoặc số tiền), chọn ngày bắt đầu - kết thúc, bật/tắt kích hoạt |
| **SCR-11** | Thống kê doanh thu & Báo cáo | Admin | Báo cáo doanh thu theo ngày (BC-01), theo tháng (BC-02), top 10 sản phẩm bán chạy (BC-03), Metric cards |
| **SCR-12** | Quản lý tài khoản & Phân quyền | Admin | Danh sách tài khoản, chuyển đổi quyền giữa Khách hàng / Nhân viên / Quản trị viên, khóa/mở khóa tài khoản |

---

## 3. Quy Tắc Giao Diện Kiểm Tra Được (UI-01 đến UI-10)
- **UI-01**: Header cố định gồm Tên cửa hàng (về trang chủ), ô tìm kiếm, liên kết Đăng nhập / tên user, giỏ hàng có badge số lượng; Menu danh mục iPhone mới, iPhone cũ, Phụ kiện, Bảo hành.
- **UI-02**: Hệ thống lưới responsive 12 cột, hiển thị mượt mà không cuộn ngang từ 360px đến 1920px.
- **UI-03**: Cỡ chữ tối thiểu 14px, vùng bấm nút trên mobile đạt chiều cao tối thiểu 40px.
- **UI-04**: Định dạng tiền tệ bắt buộc có dấu chấm ngăn cách `1.000.000 ₫`, định dạng ngày `dd/MM/yyyy`.
- **UI-05**: Ô nhập bắt buộc đánh dấu `*`, thông báo lỗi tiếng Việt hiển thị ngay dưới trường nhập.
- **UI-06**: Hành động không hoàn tác (Hủy đơn, Khóa tài khoản, Xóa) bắt buộc có Modal xác nhận.
- **UI-07**: Thông báo Toast phản hồi thành công / thất bại sau mọi thao tác.
- **UI-08**: Khách hàng từ trang chủ đến đặt hàng tối đa qua 4 bước bấm.
- **UI-09**: Trang quản trị có Sidebar bên trái theo đúng vai trò được phép truy cập.
- **UI-10**: Phân trang danh sách dài hiển thị rõ trang hiện tại, nút Trước, nút Sau.

---

## 4. Hướng Dẫn Cài Đặt & Chạy Thử Nghiệm

### Cài đặt dependencies
```bash
npm install
```

### Chạy môi trường Development (Chế độ Mock có sẵn dữ liệu test)
```bash
npm run dev
```
Mặc định hệ thống chạy tại: `http://localhost:5173`

### Chạy Unit Test kiểm thử (Vitest)
```bash
npm test
```

### Build kiểm tra sản phẩm
```bash
npm run build
```

---

## 5. Chuyển Đổi Sang Kết Nối Backend Spring Boot REST API
Trong file `.env`:
```env
# Đổi thành false khi backend Spring Boot đã chạy
VITE_USE_MOCK=false

# Địa chỉ Spring Boot REST API
VITE_API_BASE_URL=http://localhost:8080/api
```
Khi `VITE_USE_MOCK=false`, ứng dụng tự động chuyển toàn bộ request sang gọi REST API qua Axios Client kèm Bearer Token trong header `Authorization`.
