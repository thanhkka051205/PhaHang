package vn.phahang.phahang.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductVariantResponseDTO {
    private Integer id;
    private Integer variantId;
    private Integer productId;
    private String productName;
    private String name;
    private String spec;
    private String color;
    private BigDecimal price;
    private BigDecimal listPrice;
    private Integer stockQty;
}
