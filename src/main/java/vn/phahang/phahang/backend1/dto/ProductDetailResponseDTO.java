package vn.phahang.phahang.backend1.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProductDetailResponseDTO {

    private Integer productId;
    private Integer categoryId;
    private String categoryName;
    private String name;
    private String brand;
    private String description;
    private Integer warrantyMonths;
    private List<String> images;
    private List<ProductVariantResponseDTO> variants;
}