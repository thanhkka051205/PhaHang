package vn.phahang.phahang.backend1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequestDTO {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;
    @Positive(message = "ID danh mục cha phải lớn hơn 0")
    private Integer parentId;
}