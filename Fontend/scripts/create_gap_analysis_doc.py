# -*- coding: utf-8 -*-
"""
Script tự động sinh tệp Word (.docx) Báo cáo Phân tích Khoảng trống tính năng (Gap Analysis)
Backend PhaHang (Spring Boot) vs Tài liệu SRS v5.2
"""
import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()

    # Cấu hình lề trang A4 chuẩn
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Style Tiêu đề
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = title.add_run("HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ BÁN LẺ ĐIỆN MÁY PHA HẰNG\n")
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(15, 23, 42) # Deep Navy

    run_title = title.add_run("BÁO CÁO PHÂN TÍCH KHOẢNG TRỐNG TÍNH NĂNG\n(GAP ANALYSIS REPORT)\n")
    run_title.font.size = Pt(18)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(220, 38, 38) # Carmine Red

    run_desc = title.add_run("ĐỐI CHIẾU HIỆN TRẠNG BACKEND REPO (SPRING BOOT 3) VỚI TÀI LIỆU YÊU CẦU NGHIỆP VỤ SRS V5.2")
    run_desc.font.size = Pt(11)
    run_desc.font.bold = True
    run_desc.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph() # Khoảng trống

    # Bảng thông tin hành chính
    info_table = doc.add_table(rows=5, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.autofit = False

    meta_data = [
        ("Dự án áp dụng:", "Website Bán Lẻ Điện Máy Pha Hằng (Gia Dụng & Điện Lạnh - 5 Ngành hàng)"),
        ("Tài liệu SRS đối chiếu:", "SRS_Website_TBDT.docx & Tong_Hop_Cac_Man_Hinh_Website_Dien_May_Pha_Hang_SRS.docx (v5.2)"),
        ("Mã nguồn Backend đối chiếu:", "Repository: https://github.com/thanhkka051205/PhaHang (Spring Boot 3 + MySQL)"),
        ("Ngày lập báo cáo:", "12/11/2026"),
        ("Đánh giá tổng quan:", "Backend mới hoàn thiện 35% nghiệp vụ SRS; Các module Giỏ hàng, Đơn hàng, Thanh toán, Bảo hành, Voucher đang RỖNG")
    ]

    for idx, (lbl, val) in enumerate(meta_data):
        row = info_table.rows[idx]
        c0 = row.cells[0]
        c1 = row.cells[1]
        c0.width = Inches(2.2)
        c1.width = Inches(4.8)
        set_cell_background(c0, "F1F5F9")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, 80, 80, 120, 120)
        set_cell_margins(c1, 80, 80, 120, 120)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(lbl)
        r0.font.bold = True
        r0.font.size = Pt(10)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(val)
        r1.font.size = Pt(10)
        if idx == 4:
            r1.font.bold = True
            r1.font.color.rgb = RGBColor(220, 38, 38)

    doc.add_paragraph()

    # --- PHẦN I ---
    h1 = doc.add_heading(level=1)
    r_h1 = h1.add_run("I. TỔNG QUAN ĐÁNH GIÁ MỨC ĐỘ ĐÁP ỨNG NGHIỆP VỤ")
    r_h1.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph(
        "Dựa trên kết quả rà soát toàn diện mã nguồn repository Spring Boot (PhaHang) so với đặc tả yêu cầu nghiệp vụ SRS v5.2, "
        "hệ thống Backend hiện tại đang ở trạng thái 'Khung kiến trúc ban đầu' (Skeleton/Core Data Layer), chỉ mới hoàn thiện các chức năng "
        "CRUD bảng danh mục, người dùng, địa chỉ và sản phẩm đơn giản. Toàn bộ các quy trình nghiệp vụ cốt lõi của một hệ thống thương mại điện tử "
        "(Giỏ hàng, Đặt hàng, Thanh toán VietQR, Quản lý xuất kho gán số seri, Bảo hành điện tử và Thống kê doanh thu) chưa được hiện thực."
    )

    # Bảng tóm tắt phần trăm hoàn thành theo Use Case
    doc.add_paragraph().add_run("Bảng 1: Bảng ma trận mức độ hoàn thành theo 12 Use Cases của SRS").font.bold = True
    
    uc_table = doc.add_table(rows=1, cols=5)
    uc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Mã UC", "Tên Chức Năng (Use Case)", "Hiện Trạng Backend", "Mức Hoàn Thành", "Đánh Giá Thiếu Hụt"]
    hdr_cells = uc_table.rows[0].cells
    for i, title_text in enumerate(headers):
        hdr_cells[i].text = title_text
        set_cell_background(hdr_cells[i], "0F172A")
        set_cell_margins(hdr_cells[i], 100, 100, 100, 100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    uc_data = [
        ("UC-01", "Đăng ký tài khoản khách hàng", "Đã có POST /api/users nhưng chưa có API /auth/register riêng và thiếu đồng thuận PII Nghị định 13", "50%", "Trung bình (Medium)"),
        ("UC-02", "Đăng nhập hệ thống (JWT)", "Đã có POST /api/auth/login trả JWT token, nhưng DTO chưa nhúng user info và role", "80%", "Thấp (Low)"),
        ("UC-03", "Xem & Tìm kiếm sản phẩm, danh mục", "Đã có CRUD Categories, Products, /search, /filter; NHƯNG DTO thiếu price, images, variants", "60%", "Cao (High)"),
        ("UC-04", "Quản lý giỏ hàng mua sắm", "CartItemController RỖNG HOÀN TOÀN; Chưa có Service, Repository", "0%", "Nghiêm trọng (Critical)"),
        ("UC-05", "Đặt hàng & Thanh toán (COD/VietQR)", "OrderController, OrderItemController, PaymentController RỖNG HOÀN TOÀN", "0%", "Nghiêm trọng (Critical)"),
        ("UC-06", "Xem lịch sử đơn & Hủy đơn", "OrderController RỖNG; Chưa có API /orders/my-orders, /orders/lookup và hủy đơn BR-05", "0%", "Nghiêm trọng (Critical)"),
        ("UC-07", "Quản lý & Duyệt đơn hàng (Admin)", "Chưa có API duyệt đơn, chuyển trạng thái và GÁN SỐ SERI xuất kho (FR-07.5, BR-11)", "0%", "Nghiêm trọng (Critical)"),
        ("UC-08", "Quản lý sản phẩm & Kho (Admin)", "Đã có CRUD Products; Thiếu CRUD Biến thể (ProductVariantController rỗng), thiếu ảnh", "50%", "Cao (High)"),
        ("UC-09", "Quản lý khuyến mãi / Voucher", "CouponController RỖNG HOÀN TOÀN; Chưa có API tạo mã và áp dụng voucher", "0%", "Cao (High)"),
        ("UC-10", "Báo cáo doanh thu Dashboard", "Chưa có Controller Dashboard; Chưa có thống kê doanh thu 5 ngành, top bán chạy", "0%", "Cao (High)"),
        ("UC-11", "Quản lý người dùng & Phân quyền", "Đã có CRUD Users, đổi quyền role; Thiếu phân quyền chi tiết method security", "85%", "Thấp (Low)"),
        ("UC-12", "Tra cứu & Kích hoạt bảo hành điện tử", "WarrantyController RỖNG HOÀN TOÀN; Chưa có tra cứu theo Seri/SĐT và tự động kích hoạt", "0%", "Nghiêm trọng (Critical)")
    ]

    for item in uc_data:
        row = uc_table.add_row()
        for i, val in enumerate(item):
            cell = row.cells[i]
            cell.text = val
            set_cell_margins(cell, 70, 70, 90, 90)
            p = cell.paragraphs[0]
            r = p.runs[0]
            r.font.size = Pt(9)
            if i in [0, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                r.font.bold = True
            if i == 3:
                pct = int(val.replace("%", ""))
                if pct == 0:
                    set_cell_background(cell, "FEE2E2") # Đỏ nhạt
                    r.font.color.rgb = RGBColor(185, 28, 28)
                elif pct < 70:
                    set_cell_background(cell, "FEF3C7") # Vàng nhạt
                    r.font.color.rgb = RGBColor(180, 83, 9)
                else:
                    set_cell_background(cell, "DCFCE7") # Xanh lá nhạt
                    r.font.color.rgb = RGBColor(21, 128, 61)
            elif i == 4:
                if "Critical" in val:
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(220, 38, 38)
                elif "High" in val:
                    r.font.color.rgb = RGBColor(217, 119, 6)

    doc.add_paragraph()

    # --- PHẦN II ---
    h2 = doc.add_heading(level=1)
    r_h2 = h2.add_run("II. CHI TIẾT TỪNG PHÂN HỆ BACKEND ĐANG THIẾU SO VỚI SRS")
    r_h2.font.color.rgb = RGBColor(15, 23, 42)

    # 2.1
    h2_1 = doc.add_heading(level=2)
    h2_1.add_run("1. Phân Hệ Quản Lý Sản Phẩm, Biến Thể & Tồn Kho (FR-02, FR-03, FR-08, DAT-01)")
    p = doc.add_paragraph()
    p.add_run("• Hiện trạng Backend: ").bold = True
    p.add_run("Backend đã có ProductController hỗ trợ GET /api/products, GET /api/products/{id}, /search, /filter, POST, PUT, DELETE. Đã có Entity Product, ProductVariant, ProductImage trong cơ sở dữ liệu.")
    
    p_gap1 = doc.add_paragraph()
    p_gap1.add_run("• Điểm thiếu hụt nghiêm trọng so với SRS:\n").bold = True
    gaps_prod = [
        "ProductResponseDTO chưa có trường giá (price) và ảnh (images): Khi gọi GET /api/products, DTO chỉ trả về: productId, categoryId, categoryName, name, brand, description, warrantyMonths, trackSerial, isVisible. Thiếu hoàn toàn trường giá bán và danh sách ảnh khiến FE không có dữ liệu hiển thị giá và thumbnail.",
        "ProductVariantController RỖNG: Dù trong DB có bảng product_variants (variantId, spec, color, price, stockQty) nhưng chưa viết Controller/Service. Người dùng không thể xem các phiên bản màn hình inch (55\", 65\"), công suất điều hòa (9.000 BTU, 12.000 BTU) hay dung tích tủ lạnh theo Wireframe Hình 12 SRS.",
        "ProductImageController RỖNG: Chưa có API lấy danh sách thư viện ảnh chi tiết và tải ảnh đại diện lên server.",
        "Thiếu ràng buộc tồn kho không âm (DAT-01): Chưa có kiểm tra tính toàn vẹn tồn kho stockQty >= 0 khi khách đặt mua hoặc cập nhật sản phẩm."
    ]
    for g in gaps_prod:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.add_run(g)

    # 2.2
    h2_2 = doc.add_heading(level=2)
    h2_2.add_run("2. Phân Hệ Giỏ Hàng Mua Sắm (FR-04, UC-04, Bảng 18 SRS)")
    p2 = doc.add_paragraph()
    p2.add_run("• Hiện trạng Backend: ").bold = True
    p2.add_run("Đã có Entity CartItem trong Domain (cartItemId, user, productVariant, quantity). NHƯNG class CarItemController.java hoàn toàn RỖNG, chưa có CartItemService và CartItemRepository.")
    
    p_gap2 = doc.add_paragraph()
    p_gap2.add_run("• Các Endpoints bắt buộc cần bổ sung:\n").bold = True
    gaps_cart = [
        "GET /api/cart: Lấy danh sách sản phẩm trong giỏ hàng của user đang đăng nhập (kèm thông tin máy, biến thể, đơn giá, tồn kho).",
        "POST /api/cart: Thêm sản phẩm/biến thể vào giỏ hàng (kiểm tra không cho thêm vượt tồn kho hiện có theo DAT-01).",
        "PUT /api/cart/{cartItemId}: Tăng/giảm số lượng sản phẩm trong giỏ (tối thiểu 1, tối đa bằng tồn kho).",
        "DELETE /api/cart/{cartItemId}: Xóa 1 sản phẩm khỏi giỏ hàng.",
        "DELETE /api/cart: Làm trống toàn bộ giỏ hàng sau khi đặt hàng thành công."
    ]
    for g in gaps_cart:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.add_run(g)

    # 2.3
    h2_3 = doc.add_heading(level=2)
    h2_3.add_run("3. Phân Hệ Đặt Hàng & Thanh Toán (FR-05, UC-05, BR-01, BR-02, Bảng 20 SRS)")
    p3 = doc.add_paragraph()
    p3.add_run("• Hiện trạng Backend: ").bold = True
    p3.add_run("Đã có Entity Order, OrderItem, Payment trong Domain. NHƯNG cả 3 controller OrderController.java, OrderItemController.java, PaymentController.java đều RỖNG.")

    p_gap3 = doc.add_paragraph()
    p_gap3.add_run("• Các Endpoints & Logic nghiệp vụ còn thiếu:\n").bold = True
    gaps_order = [
        "POST /api/orders: Tạo đơn hàng mới từ giỏ hàng hoặc mua ngay (lưu snapshot địa chỉ người nhận, số điện thoại, tổng tiền, trừ tồn kho tương ứng).",
        "Tích hợp Phương thức thanh toán (COD & Chuyển khoản VietQR): Chưa có API tạo và xác nhận giao dịch thanh toán (bảng payments: method, amount, status, paidAt).",
        "Quy tắc chuyển trạng thái đơn (BR-01, BR-02): Chưa có luồng chuyển trạng thái từ PENDING (Chờ duyệt) -> SHIPPING (Đang giao hàng) -> COMPLETED (Hoàn tất) / CANCELLED (Đã hủy)."
    ]
    for g in gaps_order:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.add_run(g)

    # 2.4
    h2_4 = doc.add_heading(level=2)
    h2_4.add_run("4. Phân Hệ Tra Cứu Đơn & Quản Trị Đơn Hàng (FR-06, FR-07, BR-05, BR-11, Wireframe Hình 13)")
    p4 = doc.add_paragraph()
    p4.add_run("• Hiện trạng Backend: ").bold = True
    p4.add_run("Hoàn toàn chưa có bất kỳ API nào cho Khách hàng xem đơn hoặc Admin xử lý đơn hàng.")

    p_gap4 = doc.add_paragraph()
    p_gap4.add_run("• Các chức năng SRS bị thiếu:\n").bold = True
    gaps_admin_order = [
        "GET /api/orders/my-orders: Xem danh sách đơn hàng của khách đang đăng nhập (bảo mật đơn cá nhân theo DEC-001).",
        "POST /api/orders/lookup: Tra cứu đơn hàng an toàn cho khách vãng lai (yêu cầu đúng Mã đơn + Số điện thoại, che mờ thông tin cá nhân PII theo Nghị định 13/2023/NĐ-CP).",
        "PUT /api/orders/{id}/cancel: Khách hàng tự hủy đơn hàng khi đơn còn ở trạng thái Chờ xác nhận (PENDING) theo quy tắc BR-05.",
        "GET /api/admin/orders: Danh sách đơn hàng phía Quản trị viên kèm bộ lọc trạng thái (Wireframe Hình 13).",
        "GÁN SỐ SERI THIẾT BỊ XUẤT KHO (FR-07.5, BR-11, Wireframe Hình 13): Đây là nghiệp vụ đặc thù cực kỳ quan trọng của ngành điện máy: Nhân viên showroom BẮT BUỘC phải gán Số Seri (serialNo trong order_items) cho Tivi, Điều hòa, Tủ lạnh trước khi bấm xuất kho giao hàng. Backend chưa có API này."
    ]
    for g in gaps_admin_order:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.add_run(g)

    # 2.5
    h2_5 = doc.add_heading(level=2)
    h2_5.add_run("5. Phân Hệ Bảo Hành Điện Tử Chính Hãng (FR-12, UC-12, NFR-02.3, Wireframe Hình 14)")
    p5 = doc.add_paragraph()
    p5.add_run("• Hiện trạng Backend: ").bold = True
    p5.add_run("Đã có Entity Warranty (warrantyId, orderItem, startDate, endDate, status). Class WarrantyController.java hoàn toàn RỖNG.")

    p_gap5 = doc.add_paragraph()
    p_gap5.add_run("• Các chức năng SRS bị thiếu:\n").bold = True
    gaps_warranty = [
        "Tự động kích hoạt bảo hành điện tử (BR-11): Khi nhân viên gán Số Seri và đơn hàng chuyển sang Hoàn tất, hệ thống phải tự động tạo bản ghi vào bảng WARRANTIES (hạn bảo hành mặc định 24 tháng hoặc theo warrantyMonths của sản phẩm).",
        "GET /api/warranties/lookup?query=: Tra cứu bảo hành công khai cho khách hàng (không bắt buộc đăng nhập) theo Số Seri hoặc Số điện thoại mua hàng (chuẩn Wireframe Hình 14 SRS).",
        "GET /api/admin/warranties: Danh sách hồ sơ bảo hành điện tử cho kỹ thuật viên showroom Pha Hằng tra cứu khi tiếp nhận máy bảo hành tại Gia Lâm (SCR-07)."
    ]
    for g in gaps_warranty:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.add_run(g)

    # 2.6
    h2_6 = doc.add_heading(level=2)
    h2_6.add_run("6. Phân Hệ Quản Lý Mã Giảm Giá / Voucher (FR-09, UC-09, BR-04)")
    p6 = doc.add_paragraph()
    p6.add_run("• Hiện trạng Backend: ").bold = True
    p6.add_run("Đã có Entity Coupon (couponId, code, discountType, discountValue, startDate, endDate, status). Class CouponController.java hoàn toàn RỖNG.")

    p_gap6 = doc.add_paragraph()
    p_gap6.add_run("• Các chức năng SRS bị thiếu:\n").bold = True
    gaps_coupon = [
        "POST /api/coupons/apply: Kiểm tra tính hợp lệ của mã giảm giá khi khách hàng nhập ở giỏ hàng (kiểm tra ngày hiệu lực startDate <= now <= endDate, trạng thái status = true, tính số tiền giảm theo % hoặc số tiền cố định).",
        "CRUD /api/coupons: Màn hình quản trị mã khuyến mãi cho Admin (SCR-11): Tạo mã mới, đặt hạn dùng, bật/tắt voucher."
    ]
    for g in gaps_coupon:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.add_run(g)

    # 2.7
    h2_7 = doc.add_heading(level=2)
    h2_7.add_run("7. Phân Hệ Thống Kê & Báo Cáo Doanh Thu Dashboard (FR-10, UC-10, Mục 4.3 & 11 SRS)")
    p7 = doc.add_paragraph()
    p7.add_run("• Hiện trạng Backend: ").bold = True
    p7.add_run("Hoàn toàn CHƯA CÓ Controller hay Service nào phục vụ tổng hợp số liệu báo cáo kinh doanh.")

    p_gap7 = doc.add_paragraph()
    p_gap7.add_run("• Các chỉ số KPI SRS bắt buộc cần có:\n").bold = True
    gaps_dash = [
        "GET /api/admin/dashboard/stats: Thẻ KPI tổng hợp: Tổng doanh thu (₫), Số đơn chờ xác nhận, Tổng số thiết bị trong kho, Số lượng khách hàng đăng ký.",
        "GET /api/admin/dashboard/revenue-by-categories: Doanh thu chi tiết đóng góp theo 5 ngành hàng lớn (Ti vi, Điều hòa, Tủ lạnh, Quạt, Nồi cơm điện).",
        "GET /api/admin/dashboard/top-products: Bảng xếp hạng Top 5 sản phẩm bán chạy nhất kèm số lượng và doanh số."
    ]
    for g in gaps_dash:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.add_run(g)

    # 2.8
    h2_8 = doc.add_heading(level=2)
    h2_8.add_run("8. Tuân Thủ Pháp Lý & Bảo Vệ Dữ Liệu Cá Nhân (Nghị định 13/2023/NĐ-CP)")
    p8 = doc.add_paragraph()
    p8.add_run("• Hiện trạng Backend: ").bold = True
    p8.add_run("Chưa có cơ chế ghi nhận sự đồng thuận thu thập dữ liệu cá nhân khi tạo tài khoản. Endpoint POST /api/users hiện tại cho phép tạo người dùng nhưng không lưu vết trường consent / agreedPrivacyPolicy. Cần bổ sung cờ này vào User Entity và DTO đăng ký để tuân thủ Mục 8.1 SRS.")

    doc.add_paragraph()

    # --- PHẦN III ---
    h3 = doc.add_heading(level=1)
    r_h3 = h3.add_run("III. LỘ TRÌNH ĐỀ XUẤT HOÀN THIỆN BACKEND (ROADMAP)")
    r_h3.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph(
        "Để hệ thống Frontend (đã hoàn thiện 16/16 màn hình) có thể kết nối 100% vào Backend thật mà không phải dùng tầng Mock/Adapter dự phòng, "
        "nhóm phát triển Backend nên triển khai theo 3 giai đoạn ưu tiên sau:"
    )

    roadmap_table = doc.add_table(rows=1, cols=4)
    roadmap_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    rm_headers = ["Giai Đoạn", "Nội Dung Triển Khai", "Mức Ưu Tiên", "Thời Gian Dự Kiến"]
    rm_hdr_cells = roadmap_table.rows[0].cells
    for i, title_text in enumerate(rm_headers):
        rm_hdr_cells[i].text = title_text
        set_cell_background(rm_hdr_cells[i], "1E293B")
        set_cell_margins(rm_hdr_cells[i], 100, 100, 100, 100)
        p = rm_hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    rm_data = [
        ("Giai đoạn 1\n(Cốt lõi thương mại)", 
         "1. Bổ sung price, images, variants vào ProductResponseDTO\n2. Hoàn thiện CartItemController (thêm/sửa/xóa giỏ hàng)\n3. Hoàn thiện OrderController & PaymentController (tạo đơn, thanh toán)", 
         "P0\n(Bắt buộc)", "3 - 5 ngày"),
        ("Giai đoạn 2\n(Quy trình nghiệp vụ)", 
         "1. Nghiệp vụ Admin duyệt đơn & Gán Số Seri xuất kho (FR-07.5, BR-11)\n2. Tự động kích hoạt Bảo hành điện tử và WarrantyController\n3. Hoàn thiện CouponController (áp dụng mã giảm giá)", 
         "P1\n(Trọng yếu)", "3 - 4 ngày"),
        ("Giai đoạn 3\n(Báo cáo & Hoàn thiện)", 
         "1. Xây dựng API Dashboard thống kê doanh thu 5 ngành hàng\n2. Bổ sung trường đồng thuận Nghị định 13/2023/NĐ-CP vào User\n3. Kiểm thử tích hợp toàn diện FE - BE", 
         "P2\n(Hoàn thiện)", "2 - 3 ngày")
    ]

    for item in rm_data:
        row = roadmap_table.add_row()
        for i, val in enumerate(item):
            cell = row.cells[i]
            cell.text = val
            set_cell_margins(cell, 80, 80, 100, 100)
            p = cell.paragraphs[0]
            r = p.runs[0]
            r.font.size = Pt(9)
            if i in [0, 2, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                r.font.bold = True
            if i == 2:
                if "P0" in val:
                    r.font.color.rgb = RGBColor(220, 38, 38)
                    set_cell_background(cell, "FEE2E2")
                elif "P1" in val:
                    r.font.color.rgb = RGBColor(217, 119, 6)
                    set_cell_background(cell, "FEF3C7")
                else:
                    r.font.color.rgb = RGBColor(37, 99, 235)
                    set_cell_background(cell, "EFF6FF")

    doc.add_paragraph()
    p_end = doc.add_paragraph()
    p_end.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_end = p_end.add_run("Người lập báo cáo: Ban Kiến Trúc Dự Án Điện Máy Pha Hằng\n(Tham chiếu mã nguồn: PhaHang Spring Boot vs SRS v5.2)")
    r_end.font.italic = True
    r_end.font.size = Pt(9.5)
    r_end.font.color.rgb = RGBColor(100, 116, 139)

    out_docx_path = "d:/zz/BA_Bao_Cao_Khoang_Trong_Backend_vs_SRS.docx"
    doc.save(out_docx_path)
    print(f"Đã lưu tệp Word thành công tại: {out_docx_path}")

if __name__ == "__main__":
    create_document()
