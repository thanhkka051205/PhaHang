package vn.phahang.phahang.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.phahang.phahang.dto.PaymentDTO;
import vn.phahang.phahang.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // API Lấy danh sách thanh toán
    // GET /api/payments
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(this.paymentService.getAllPayments());
    }


    // API Tạo mới thanh toán COD
    // POST /api/payments
    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(@Valid @RequestBody PaymentDTO postPayment) {
        PaymentDTO createdPayment = paymentService.createPayment(postPayment);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
    }

    // API Xác nhận đã thu tiền COD
    // PUT /api/payments/{paymentId}/confirm
    @PutMapping("/{paymentId}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PaymentDTO> confirmPaid(@PathVariable("paymentId") Integer paymentId) {
        return ResponseEntity.ok(this.paymentService.confirmPaid(paymentId));
    }

    // Chi tiết đơn hàng
    // GET /api/payments/order/{orderId}
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentDTO> getPaymentByOrderId(@PathVariable("orderId") Integer orderId) {
        return ResponseEntity.ok(this.paymentService.getPaymentByOrderId(orderId));
    }

    // Hủy thanh toán
    // PUT /api/payments/{paymentId}/cancel
    @PutMapping("/{paymentId}/cancel")
    public ResponseEntity<PaymentDTO> paymentCancel(@PathVariable("paymentId") Integer paymentId) {
        return ResponseEntity.ok(this.paymentService.paymentCancel(paymentId));
    }
}
