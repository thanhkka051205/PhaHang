package vn.phahang.phahang.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class PaymentDTO {
    private Integer paymentId;
    private Integer orderId;
    private String method;
    private BigDecimal amount;
    private String status;
    private LocalDateTime paidAt;
    private String receiverName;
    private String receiverPhone;
}
