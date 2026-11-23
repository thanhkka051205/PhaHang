package vn.phahang.phahang.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.phahang.phahang.dto.OrderResponseDTO;
import vn.phahang.phahang.service.OrderService;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // API lấy danh sách đơn hàng dành cho Admin
    // GET /api/admin/orders
    @GetMapping
    public ResponseEntity<Page<OrderResponseDTO>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) Integer orderId,
            @RequestParam(required = false) String receiverPhone,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin(
                status, fromDate, toDate, orderId, receiverPhone, pageable));
    }

    // API cập nhật trạng thái đơn hàng
    // PUT /api/admin/orders/{orderId}/status
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable("orderId") Integer orderId,
            @RequestParam("status") String status) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(orderId, status));
    }
}
