package vn.phahang.phahang.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.phahang.phahang.dto.CouponDTO;
import vn.phahang.phahang.service.CouponService;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    //Lấy danh sách mã giảm giá
    // API GET /api/coupons
    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        return ResponseEntity.ok(this.couponService.getAllCoupons());
    }

    // Tìm mã giảm giá
    // API GET /api/coupons/{code}
    @GetMapping("/{code}")
    public ResponseEntity<CouponDTO> getCouponByCode(@PathVariable("code") String code) {
        return ResponseEntity.ok(this.couponService.getCouponByCode(code));
    }

    //Tạo mã giảm giá
    // API POST /api/coupons
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<CouponDTO> createCoupon(@Valid @RequestBody CouponDTO couponDTO) {
        CouponDTO dto = this.couponService.createCoupon(couponDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // Cập nhật mã giảm giá
    // API PUT /api/coupons/{code}
    @PutMapping("/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<CouponDTO> updateCoupon(
            @PathVariable("code") String code,
            @RequestBody CouponDTO couponDTO){
        return ResponseEntity.ok(this.couponService.updateCoupon(code, couponDTO));
    }

    // Xóa mã giảm giá theo code
    // API DEL /api/coupons/{code}
    @DeleteMapping("/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable("code") String code) {
        this.couponService.deleteCoupon(code);
        return ResponseEntity.noContent().build();
    }

    // Áp dụng mã giảm giá
    // API POST /api/coupons/apply
    @PostMapping("/apply")
    public ResponseEntity<CouponDTO> applyCoupon(
            @RequestParam("code") String code,
            @RequestParam("sumAmount") BigDecimal sumAmount) {

        CouponDTO result = this.couponService.applyCouponToCart(code, sumAmount);
        return ResponseEntity.ok(result);
    }
}