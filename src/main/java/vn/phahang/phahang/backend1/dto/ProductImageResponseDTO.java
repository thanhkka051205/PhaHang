package vn.phahang.phahang.backend1.dto;

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