package vn.phahang.phahang.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.domain.Order;
import vn.phahang.phahang.domain.Payment;
import vn.phahang.phahang.dto.PaymentDTO;
import vn.phahang.phahang.repository.OrderRepository;
import vn.phahang.phahang.repository.PaymentRepository;

@Service
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    // API tạo mới thanh toán COD
    @Transactional
    public PaymentDTO createPayment(PaymentDTO paymentDTO) {
        Order order = orderRepository.findById(paymentDTO.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + paymentDTO.getOrderId()));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod("COD");
        payment.setAmount(paymentDTO.getAmount());
        payment.setStatus("unpaid");
        payment.setPaidAt(null);

        Payment savedPayment = this.paymentRepository.save(payment);
        return toDTO(savedPayment);
    }

    // API xác nhận đã thu tiền COD
    @Transactional
    public PaymentDTO confirmPaid(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán ID: " + paymentId));

        if ("paid".equalsIgnoreCase(payment.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán trước đó");
        }

        if ("cancelled".equalsIgnoreCase(payment.getStatus())) {
            throw new RuntimeException("Giao dịch thanh toán này đã bị hủy trước đó");
        }

        payment.setStatus("paid");
        payment.setPaidAt(LocalDateTime.now());

        Payment updatedPayment = this.paymentRepository.save(payment);
        return toDTO(updatedPayment);
    }

    // API lấy danh sách tất cả thanh toán
    @Transactional
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    // Lấy thông tin thanh toán theo orderId
    @Transactional
    public PaymentDTO getPaymentByOrderId(Integer orderId) {
        Payment payment = paymentRepository.findByOrder_OrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thanh toán cho đơn hàng ID: " + orderId));
        return toDTO(payment);
    }

    // API cancelled
    @Transactional
    public PaymentDTO paymentCancel(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán ID: " + paymentId));

        if ("paid".equalsIgnoreCase(payment.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán trước đó");
        }

        if ("unpaid".equalsIgnoreCase(payment.getStatus())) {
            payment.setStatus("cancelled");
        }

        Payment updatedPayment = this.paymentRepository.save(payment);
        return toDTO(updatedPayment);
    }

    // Entity sang DTO
    public PaymentDTO toDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setMethod(payment.getMethod());
        dto.setAmount(payment.getAmount());
        dto.setStatus(payment.getStatus());
        dto.setPaidAt(payment.getPaidAt());

        if (payment.getOrder() != null) {
            dto.setOrderId(payment.getOrder().getOrderId());
            dto.setReceiverName(payment.getOrder().getReceiverName());
            dto.setReceiverPhone(payment.getOrder().getReceiverPhone());
        }
        return dto;
    }
}
