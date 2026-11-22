package vn.phahang.phahang.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class CouponDTO {
    private Integer couponId;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    private Integer usageLimit;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean status = true;

    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}
