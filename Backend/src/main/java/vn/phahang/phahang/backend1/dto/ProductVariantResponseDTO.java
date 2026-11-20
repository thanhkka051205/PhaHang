package vn.phahang.phahang.backend1.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductVariantResponseDTO {
    private Integer variantId;
    private Integer productId;
    private String productName;
    private String spec;
    private String color;
    private BigDecimal price;
    private Integer stockQty;
    
}
