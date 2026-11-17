package vn.phahang.phahang.backend1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageRequestDTO {
    @NotNull(message = "ID sản phẩm không được để trống")
    @Positive(message = "ID sản phẩm phải lớn hơn 0")
    private Integer productId;

    @NotBlank(message = "Đường dẫn ảnh không được để trống")
    private String imagePath;

    @PositiveOrZero(message = "Thứ tự ảnh không được âm")
    private Integer sortOrder = 0;
}
