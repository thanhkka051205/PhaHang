package vn.phahang.phahang.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemResponseDTO {
    private Integer id;
    private Integer cartItemId;
    private Integer variantId;
    private Integer productId;
    private String productName;
    private String spec;
    private String color;
    private String variantSpec;
    private String variantColor;
    private String image;
    private String thumbnail;
    private BigDecimal price;
    private BigDecimal listPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private Integer stockQty;
    private Boolean isVisible;
}