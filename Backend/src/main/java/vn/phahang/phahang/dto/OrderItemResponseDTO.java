package vn.phahang.phahang.dto;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemResponseDTO {
    private Integer orderItemId;
    private Integer variantId;
    private Integer productId;
    private String productName;
    private String spec;
    private String color;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private String serialNo;
}