package vn.phahang.phahang.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class CouponDTO {
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotBlank(message = "Loại giảm giá không được để trống")
    private String discountType;

    @NotNull(message = "Giá trị không được để trống")
    @Positive(message = "Giá trị phải lớn hơn 0")
    private BigDecimal discountValue;

    @NotNull(message = "Đơn hàng tối thiểu không được để trống")
    @PositiveOrZero(message = "Đơn hàng tối thiểu không được nhỏ hơn 0")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Positive(message = "Giới hạn lượt sử dụng phải lớn hơn 0")
    private Integer usageLimit;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}