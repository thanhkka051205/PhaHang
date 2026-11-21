package vn.phahang.phahang.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.domain.Coupon;
import vn.phahang.phahang.dto.ApplyCouponDTO;
import vn.phahang.phahang.dto.CouponDTO;
import vn.phahang.phahang.repository.CouponRepository;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    // Tạo mã giảm giá mới
    @Transactional
    public CouponDTO createCoupon(CouponDTO postCoupon) {
        String normalizedCode = postCoupon.getCode().toUpperCase().trim();

        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Mã giảm giá '" + normalizedCode + "' đã tồn tại trong hệ thống");
        }

        if (postCoupon.getStartDate() != null && postCoupon.getEndDate() != null
                && postCoupon.getEndDate().isBefore(postCoupon.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc không được trước ngày bắt đầu");
        }

        String type = postCoupon.getDiscountType().toUpperCase().trim();
        if ("PERCENT".equals(type) && postCoupon.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Giảm giá theo phần trăm phải nằm trong khoảng từ 1 đến 100");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(normalizedCode);
        coupon.setDiscountType(type);
        coupon.setDiscountValue(postCoupon.getDiscountValue());
        coupon.setMinOrderAmount(
                postCoupon.getMinOrderAmount() != null ? postCoupon.getMinOrderAmount() : BigDecimal.ZERO
        );
        coupon.setUsageLimit(postCoupon.getUsageLimit());
        coupon.setStartDate(postCoupon.getStartDate());
        coupon.setEndDate(postCoupon.getEndDate());
        coupon.setStatus(postCoupon.getStatus() != null ? postCoupon.getStatus() : true);

        Coupon savedCoupon = couponRepository.save(coupon);
        return mapToDTO(savedCoupon);
    }

    // Kiểm tra tính hợp lệ của mã giảm giá
    public CouponDTO validateCode(String code, BigDecimal sumAmount) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Mã giảm giá không được để trống");
        }
        if (sumAmount == null || sumAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Tổng tiền giỏ hàng phải lớn hơn 0!");
        }

        String normalizedCode = code.toUpperCase().trim();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không tồn tại"));

        if (!Boolean.TRUE.equals(coupon.getStatus())) {
            throw new IllegalArgumentException("Mã giảm giá đang bị tắt");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new IllegalArgumentException("Mã giảm giá chưa đến ngày áp dụng");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new IllegalArgumentException("Mã giảm giá đã hết hạn!");
        }

        BigDecimal minOrder = coupon.getMinOrderAmount() != null ? coupon.getMinOrderAmount() : BigDecimal.ZERO;
        if (sumAmount.compareTo(minOrder) < 0) {
            throw new IllegalArgumentException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã");
        }

        if (coupon.getUsageLimit() != null && coupon.getCouponId() != null) {
            long usedCount = couponRepository.countUsedByCouponId(coupon.getCouponId());
            if (usedCount >= coupon.getUsageLimit()) {
                throw new IllegalArgumentException("Mã giảm giá đã hết lượt sử dụng");
            }
        }

        return mapToDTO(coupon);
    }

    // Áp dụng mã giảm giá vào giỏ hàng / đơn hàng
    public ApplyCouponDTO applyCouponToCart(String code, BigDecimal sumAmount) {
        CouponDTO validCoupon = validateCode(code, sumAmount);
        BigDecimal discountAmount = BigDecimal.ZERO;
        String type = validCoupon.getDiscountType().toUpperCase().trim();

        if ("PERCENT".equals(type)) {
            discountAmount = sumAmount
                    .multiply(validCoupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN);
        } else if ("AMOUNT".equals(type) || "FIXED".equals(type)) {
            discountAmount = validCoupon.getDiscountValue();
        } else {
            throw new IllegalArgumentException("Loại giảm giá không hợp lệ!");
        }

        if (discountAmount.compareTo(sumAmount) > 0) {
            discountAmount = sumAmount;
        }

        BigDecimal finalAmount = sumAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        ApplyCouponDTO response = new ApplyCouponDTO();
        response.setCode(validCoupon.getCode());
        response.setSumAmount(sumAmount);
        response.setDiscountAmount(discountAmount);
        response.setFinalAmount(finalAmount);

        return response;
    }

    // Chuyển đổi Entity sang DTO
    public CouponDTO mapToDTO(Coupon coupon) {
        CouponDTO dto = new CouponDTO();
        dto.setCouponId(coupon.getCouponId());
        dto.setCode(coupon.getCode() != null ? coupon.getCode().toUpperCase().trim() : null);
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