package vn.phahang.phahang.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductResponseDTO {
    private Integer productId;
    private Integer categoryId;
    private String categoryName;
    private String name;
    private String brand;
    private String image;
    private BigDecimal price;
}