package vn.phahang.phahang.controller;

import vn.phahang.phahang.domain.RestResponse;
import vn.phahang.phahang.dto.ApplyCouponDTO;
import vn.phahang.phahang.dto.CouponDTO;
import vn.phahang.phahang.service.CouponService;

import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
public class CouponController {
    private final CouponService couponService;

    public CouponController(CouponService couponService){
        this.couponService = couponService;
    }

    //API tạo mới Coupon
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> createCoupon(@Valid @RequestBody CouponDTO postCoupon){
        CouponDTO dto = couponService.createCoupon(postCoupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    //Apply code
    @PostMapping("/apply")
    public ResponseEntity<RestResponse<ApplyCouponDTO>> applyCoupon(
            @RequestParam("code") String code,
            @RequestParam("sumAmount") BigDecimal sumAmount) {

        ApplyCouponDTO result = couponService.applyCouponToCart(code, sumAmount);

        RestResponse<ApplyCouponDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.OK.value());
        res.setData(result);
        res.setMessage("Áp dụng mã giảm giá thành công!");

        return ResponseEntity.ok(res);
    }
}
