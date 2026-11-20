package vn.phahang.phahang.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductVariantRequestDTO {

    @NotNull(message = "ID sản phẩm không được để trống")
    @Positive(message = "ID sản phẩm phải lớn hơn 0")
    private Integer productId;

    private String spec;
    private String color;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.00", message = "Giá sản phẩm không được âm")
    private BigDecimal price;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private Integer stockQty;
}