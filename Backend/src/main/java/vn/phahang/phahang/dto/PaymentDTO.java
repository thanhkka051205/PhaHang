package vn.phahang.phahang.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentDTO {

    private Integer paymentId;

    @NotNull(message = "Order id không được để trống")
    private Integer orderId;

    @NotBlank(message = "Phương thức không được để trống")
    private String paymentMethod;

    @NotNull(message = "Số tiền không hợp lệ")
    @DecimalMin(value = "0.01", message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount; 

    private String status;
    private LocalDateTime paidAt; 
}