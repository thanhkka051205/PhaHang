package vn.phahang.phahang.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequestDTO {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 150, message = "Tên sản phẩm không được vượt quá 150 ký tự")
    private String name;

    private String brand;
    private String description;

    @Positive(message = "ID danh mục phải lớn hơn 0")
    private Integer categoryId;

    @Valid
    private CategoryRef category;

    @PositiveOrZero(message = "Thời hạn bảo hành không được âm")
    private Integer warrantyMonths = 0;

    private Boolean trackSerial = false;
    private Boolean isVisible = true;

    @AssertTrue(message = "Vui lòng chọn danh mục")
    public boolean isCategoryValid() {
        Integer id = resolveCategoryId();
        return id != null && id > 0;
    }

    public Integer resolveCategoryId() {
        if (categoryId != null) {
            return categoryId;
        }
        return category != null ? category.getCategoryId() : null;
    }

    @Getter
    @Setter
    public static class CategoryRef {
        @Positive(message = "ID danh mục phải lớn hơn 0")
        private Integer categoryId;
    }
}