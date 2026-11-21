package vn.phahang.phahang.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import vn.phahang.phahang.domain.Coupon;
import vn.phahang.phahang.domain.RestResponse;
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

    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        return ResponseEntity.ok(this.couponService.fetchAllCoupons());
    }

    @PostMapping
    public ResponseEntity<CouponDTO> createCoupon(@Valid @RequestBody Coupon postCoupon) {
        CouponDTO dto = this.couponService.createCoupon(postCoupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{code}")
    public ResponseEntity<CouponDTO> updateCoupon(
            @PathVariable("code") String code,
            @RequestBody Coupon reqCoupon) {
        return ResponseEntity.ok(this.couponService.updateCoupon(code, reqCoupon));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable("code") String code) {
        this.couponService.deleteCoupon(code);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/apply")
    public ResponseEntity<RestResponse<CouponDTO>> applyCoupon(
            @RequestParam("code") String code,
            @RequestParam("sumAmount") BigDecimal sumAmount) {

        CouponDTO result = this.couponService.applyCouponToCart(code, sumAmount);

        RestResponse<CouponDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.OK.value());
        res.setData(result);
        res.setMessage("Áp dụng mã giảm giá thành công!");

        return ResponseEntity.ok(res);
    }
}
