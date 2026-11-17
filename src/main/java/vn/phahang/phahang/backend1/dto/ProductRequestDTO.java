package vn.phahang.phahang.backend1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequestDTO {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;
    private String brand;
    private String description;
    @NotNull(message = "Vui lòng chọn danh mục")
    @Positive(message = "ID danh mục phải lớn hơn 0")
    private Integer categoryId;
    @PositiveOrZero(message = "Thời hạn bảo hành không được âm")
    private Integer warrantyMonths = 0;
    private Boolean trackSerial = false;
    private Boolean isVisible = true;
}
