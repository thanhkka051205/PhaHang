package vn.phahang.phahang.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductResponseDTO {
    private Integer id;
    private Integer productId;
    private Integer categoryId;
    private String categoryName;
    private String name;
    private String brand;
    private String description;
    private Integer warrantyMonths;
    private Boolean trackSerial;
    private Boolean isVisible;
    private String image;
    private String imageUrl;
    private String thumbnail;
    private List<String> images;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private List<ProductVariantResponseDTO> variants;
}