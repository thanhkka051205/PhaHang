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

    // Lấy danh sách mã giảm giá
    public List<CouponDTO> fetchAllCoupons() {
        return this.couponRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    // Tạo mã giảm giá mới
    @Transactional
    public CouponDTO createCoupon(Coupon postCoupon) {
        if (this.couponRepository.existsByCodeIgnoreCase(postCoupon.getCode().trim())) {
            throw new RuntimeException("Mã giảm giá đã tồn tại");
        }

        postCoupon.setCode(postCoupon.getCode().trim().toUpperCase());
        Coupon savedCoupon = this.couponRepository.save(postCoupon);
        return this.mapToDTO(savedCoupon);
    }

    // Cập nhật mã giảm giá theo code
    @Transactional
    public CouponDTO updateCoupon(String code, Coupon reqCoupon) {
        Coupon currentCoupon = this.couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        if (reqCoupon.getDiscountType() != null) {
            currentCoupon.setDiscountType(reqCoupon.getDiscountType());
        }
        if (reqCoupon.getDiscountValue() != null) {
            currentCoupon.setDiscountValue(reqCoupon.getDiscountValue());
        }
        if (reqCoupon.getMinOrderAmount() != null) {
            currentCoupon.setMinOrderAmount(reqCoupon.getMinOrderAmount());
        }
        if (reqCoupon.getUsageLimit() != null) {
            currentCoupon.setUsageLimit(reqCoupon.getUsageLimit());
        }
        if (reqCoupon.getStartDate() != null) {
            currentCoupon.setStartDate(reqCoupon.getStartDate());
        }
        if (reqCoupon.getEndDate() != null) {
            currentCoupon.setEndDate(reqCoupon.getEndDate());
        }
        if (reqCoupon.getStatus() != null) {
            currentCoupon.setStatus(reqCoupon.getStatus());
        }

        Coupon updated = this.couponRepository.save(currentCoupon);
        return this.mapToDTO(updated);
    }

    // Xóa mã giảm giá theo code
    @Transactional
    public void deleteCoupon(String code) {
        Coupon coupon = this.couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
        this.couponRepository.delete(coupon);
    }

    // Kiểm tra điều kiện và áp dụng mã giảm giá vào giỏ hàng
    public CouponDTO applyCouponToCart(String code, BigDecimal sumAmount) {
        if (code == null || code.isBlank()) {
            throw new RuntimeException("Vui lòng nhập mã giảm giá");
        }
        if (sumAmount == null || sumAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Tổng tiền đơn hàng không hợp lệ");
        }

        Coupon coupon = this.couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        if (!Boolean.TRUE.equals(coupon.getStatus())) {
            throw new RuntimeException("Mã giảm giá đã bị khóa");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new RuntimeException("Mã giảm giá chưa đến ngày áp dụng");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn");
        }
        if (coupon.getMinOrderAmount() != null && sumAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu");
        }
        if (coupon.getUsageLimit() != null) {
            long usedCount = this.couponRepository.countUsedByCouponId(coupon.getCouponId());
            if (usedCount >= coupon.getUsageLimit()) {
                throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng");
            }
        }

        return this.applyCoupon(coupon, sumAmount);
    }

    // Tính số tiền được giảm
    public CouponDTO applyCoupon(Coupon coupon, BigDecimal sumAmount) {
        BigDecimal discountAmount = BigDecimal.ZERO;
        String type = coupon.getDiscountType();

        if ("PERCENT".equalsIgnoreCase(type)) {
            discountAmount = sumAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN);
        } else if ("AMOUNT".equalsIgnoreCase(type) || "FIXED".equalsIgnoreCase(type)) {
            discountAmount = coupon.getDiscountValue();
        } else {
            throw new RuntimeException("Loại giảm giá không hợp lệ");
        }

        if (discountAmount.compareTo(sumAmount) > 0) {
            discountAmount = sumAmount;
        }

        BigDecimal finalAmount = sumAmount.subtract(discountAmount);

        CouponDTO dto = this.mapToDTO(coupon);
        dto.setDiscountAmount(discountAmount);
        dto.setFinalAmount(finalAmount);
        return dto;
    }

    // Chuyển đổi Entity sang DTO
    public CouponDTO mapToDTO(Coupon coupon) {
        CouponDTO dto = new CouponDTO();
        dto.setCode(coupon.getCode());
        dto.setDiscountType(coupon.getDiscountType());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinOrderAmount(coupon.getMinOrderAmount());
        dto.setUsageLimit(coupon.getUsageLimit());
        return dto;
    }
}