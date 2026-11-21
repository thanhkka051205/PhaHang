package vn.phahang.phahang.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.phahang.phahang.domain.Order;
import vn.phahang.phahang.domain.Payment;
import vn.phahang.phahang.dto.PaymentDTO;
import vn.phahang.phahang.repository.OrderRepository;
import vn.phahang.phahang.repository.PaymentRepository;

@Service
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository){
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    // Tạo thanh toán mới trong DB
    public PaymentDTO createPayment(PaymentDTO paymentDTO){
        Order order = orderRepository.findById(paymentDTO.getOrderId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        Payment p = new Payment();
        p.setOrder(order); 
        p.setPaymentMethod("COD");
        p.setAmount(paymentDTO.getAmount());
        p.setStatus("UNPAID");
        p.setPaidAt(null);

        Payment savePayment = this.paymentRepository.save(p);

        // Convert sang DTO trả về
        PaymentDTO responseDTO = new PaymentDTO();
        responseDTO.setPaymentId(savePayment.getPaymentId());
        responseDTO.setOrderId(order.getOrderId());
        responseDTO.setPaymentMethod(savePayment.getPaymentMethod());
        responseDTO.setAmount(savePayment.getAmount());
        responseDTO.setStatus(savePayment.getStatus());
        responseDTO.setPaidAt(savePayment.getPaidAt());

        return responseDTO;
    }

    //Xóa
    public void handleDeletePayment(Integer paymentId) {
        this.paymentRepository.deleteById(paymentId);
    }

    //Lay payment theo id
    public Optional<Payment> getByIdPaymet(Integer paymentId){
        return paymentRepository.findById(paymentId);
    }
}