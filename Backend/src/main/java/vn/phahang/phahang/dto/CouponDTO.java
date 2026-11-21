package vn.phahang.phahang.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CouponDTO {

    private Integer couponId;

    @NotBlank(message = "Mã giảm giá không được để trống")
    @Size(max = 30, message = "Mã giảm giá tối đa 30 ký tự")
    private String code;

    @NotBlank(message = "Loại giảm giá không được để trống")
    @Size(max = 20, message = "Loại giảm giá tối đa 20 ký tự")
    private String discountType;

    @NotNull(message = "Giá trị không được để trống")
    @Positive(message = "Giá trị phải lớn hơn 0")
    private BigDecimal discountValue;

    @NotNull(message = "Đơn hàng tối thiểu không được để trống")
    @PositiveOrZero(message = "Đơn hàng tối thiểu không được nhỏ hơn 0")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Positive(message = "Giới hạn lượt sử dụng phải lớn hơn 0")
    private Integer usageLimit;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @NotNull(message = "Trạng thái không được để trống")
    private Boolean status = true;
}