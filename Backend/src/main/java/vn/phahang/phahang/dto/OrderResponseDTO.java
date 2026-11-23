package vn.phahang.phahang.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderResponseDTO {
    private Integer orderId;
    private Integer userId;
    private String status;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String receiverName;
    private String receiverPhone;
    private String shipAddress;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;
}