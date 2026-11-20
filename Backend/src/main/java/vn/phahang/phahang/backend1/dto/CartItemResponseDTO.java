package vn.phahang.phahang.backend1.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemResponseDTO {
    private Integer cartItemId;
    private Integer variantId;
    private Integer productId;
    private String productName;
    private String spec;
    private String color;
    private String image;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private Integer stockQty;
    private Boolean isVisible;
}