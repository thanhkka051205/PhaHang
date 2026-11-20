package vn.phahang.phahang.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageResponseDTO {
    private Integer imageId;
    private Integer productId;
    private String imagePath;
    private Integer sortOrder;
}