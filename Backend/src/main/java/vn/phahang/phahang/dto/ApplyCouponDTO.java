package vn.phahang.phahang.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class ApplyCouponDTO {
    private String code; //ma giam gia
    private BigDecimal sumAmount; //tong tien
    private BigDecimal discountAmount; //so tien giam
    private BigDecimal finalAmount; //tong tien sau khi giam
}
