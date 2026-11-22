package vn.phahang.phahang.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.domain.Coupon;
import vn.phahang.phahang.dto.CouponDTO;
import vn.phahang.phahang.repository.CouponRepository;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    // API Lấy danh sách
    @Transactional
    public List<CouponDTO> getAllCoupons() {
        return this.couponRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    // API Lấy theo code
    @Transactional
    public CouponDTO getCouponByCode(String code) {
        Coupon coupon = this.couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá ID: " + code));
        return this.mapToDTO(coupon);
    }

    // API Tạo mới mã giảm giá
    @Transactional
    public CouponDTO createCoupon(CouponDTO couponDTO) {
        if (couponRepository.findByCode(couponDTO.getCode().trim().toUpperCase()).isPresent()) {
            throw new RuntimeException("Mã giảm giá đã tồn tại");
        }

        Coupon newCoupon = new Coupon();
        newCoupon.setCode(couponDTO.getCode().trim().toUpperCase());
        newCoupon.setDiscountType(couponDTO.getDiscountType());
        newCoupon.setDiscountValue(couponDTO.getDiscountValue());
        newCoupon.setMinOrderAmount(couponDTO.getMinOrderAmount());
        newCoupon.setUsageLimit(couponDTO.getUsageLimit());
        newCoupon.setStartDate(couponDTO.getStartDate());
        newCoupon.setEndDate(couponDTO.getEndDate());
        newCoupon.setStatus(true);

        Coupon savedCoupon = this.couponRepository.save(newCoupon);
        return this.mapToDTO(savedCoupon);
    }

    // API Cập nhật 
    @Transactional
    public CouponDTO updateCoupon(String code, CouponDTO couponDTO) {
        Coupon currentCoupon = this.couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá: " + code));

        currentCoupon.setDiscountValue(couponDTO.getDiscountValue());
        currentCoupon.setMinOrderAmount(couponDTO.getMinOrderAmount());
        currentCoupon.setUsageLimit(couponDTO.getUsageLimit());
        currentCoupon.setEndDate(couponDTO.getEndDate());

        Coupon updated = this.couponRepository.save(currentCoupon);
        return this.mapToDTO(updated);
    }

    // API xóa code
    @Transactional
    public void deleteCoupon(String code) {
        Coupon currentCoupon = this.couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá: " + code));

        this.couponRepository.delete(currentCoupon);
    }

    // API Áp dụng mã giảm giá
    @Transactional
    public CouponDTO applyCouponToCart(String code, BigDecimal sumAmount) {
        Coupon currentCoupon = this.couponRepository.findByCode(code.trim().toUpperCase())
                .filter(c -> Boolean.TRUE.equals(c.getStatus()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá: " + code));

        LocalDateTime now = LocalDateTime.now();
        if (currentCoupon.getEndDate() != null && now.isAfter(currentCoupon.getEndDate())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn");
        }
        if (sumAmount == null 
            || sumAmount.compareTo(BigDecimal.ZERO) <= 0 
            || (currentCoupon.getMinOrderAmount() != null
            && sumAmount.compareTo(currentCoupon.getMinOrderAmount()) < 0)) {
            throw new RuntimeException("Đơn hàng phải > 0 và đạt giá trị tối thiểu: " + currentCoupon.getMinOrderAmount());
        }

        //Tính tiền
        BigDecimal discountAmount = BigDecimal.ZERO;
        if ("PERCENT".equalsIgnoreCase(currentCoupon.getDiscountType())) {
            discountAmount = sumAmount
                    .multiply(currentCoupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN);
        } else if ("AMOUNT".equalsIgnoreCase(currentCoupon.getDiscountType()) || "FIXED".equalsIgnoreCase(currentCoupon.getDiscountType())) {
            discountAmount = currentCoupon.getDiscountValue();
        } else {
            throw new RuntimeException("Loại giảm giá không hợp lệ");
        }

        if (discountAmount.compareTo(sumAmount) > 0) {
            discountAmount = sumAmount;
        }

        BigDecimal finalAmount = sumAmount.subtract(discountAmount);

        CouponDTO dto = this.mapToDTO(currentCoupon);
        dto.setDiscountAmount(discountAmount);
        dto.setFinalAmount(finalAmount);
        return dto;
    }


    // Chuyển đổi Entity sang DTO
    public CouponDTO mapToDTO(Coupon coupon) {
        CouponDTO dto = new CouponDTO();
        dto.setCouponId(coupon.getCouponId());
        dto.setCode(coupon.getCode());
        dto.setDiscountType(coupon.getDiscountType());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinOrderAmount(coupon.getMinOrderAmount());
        dto.setUsageLimit(coupon.getUsageLimit());
        dto.setStartDate(coupon.getStartDate());
        dto.setEndDate(coupon.getEndDate());
        dto.setStatus(coupon.getStatus());
        return dto;
    }
}
