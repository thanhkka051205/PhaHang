package vn.phahang.phahang.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.phahang.phahang.dto.OrderItemResponseDTO;
import vn.phahang.phahang.dto.OrderRequestDTO;
import vn.phahang.phahang.dto.OrderResponseDTO;
import vn.phahang.phahang.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // API tạo đơn hàng từ giỏ hàng
    // POST /api/orders
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(
            Authentication authentication,
            @Valid @RequestBody OrderRequestDTO request) {
        OrderResponseDTO response = orderService.createOrder(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // API lấy danh sách đơn hàng của người dùng
    // GET /api/orders/my-orders
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrders(authentication.getName()));
    }

    // API xem chi tiết đơn hàng
    // GET /api/orders/{orderId}
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderById(
            Authentication authentication,
            @PathVariable("orderId") Integer orderId) {
        return ResponseEntity.ok(orderService.getOrderById(authentication.getName(), orderId));
    }

    // API lấy danh sách sản phẩm trong đơn hàng
    // GET /api/orders/{orderId}/items
    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItemResponseDTO>> getOrderItems(
            Authentication authentication,
            @PathVariable("orderId") Integer orderId) {
        return ResponseEntity.ok(orderService.getOrderItems(authentication.getName(), orderId));
    }

    // API hủy đơn hàng
    // PUT /api/orders/{orderId}/cancel
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDTO> cancelOrder(
            Authentication authentication,
            @PathVariable("orderId") Integer orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(authentication.getName(), orderId));
    }

    // API tra cứu đơn hàng bằng mã đơn và số điện thoại người nhận
    // POST /api/orders/lookup
    @PostMapping("/lookup")
    public ResponseEntity<OrderResponseDTO> lookupOrder(
            @RequestParam("orderId") Integer orderId,
            @RequestParam("receiverPhone") String receiverPhone) {
        return ResponseEntity.ok(orderService.lookupOrder(orderId, receiverPhone));
    }
}