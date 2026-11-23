package vn.phahang.phahang.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.domain.Coupon;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Integer> {

    // Kiểm tra mã giảm giá đã tồn tại trong hệ thống hay chưa
    boolean existsByCode(String code);

    boolean existsByCodeIgnoreCase(String code);

    // Tìm kiếm mã giảm giá chính xác hoặc không phân biệt hoa thường
    Optional<Coupon> findByCode(String code);

    Optional<Coupon> findByCodeIgnoreCase(String code);

    // Lọc danh sách mã theo trạng thái bật/tắt (status)
    List<Coupon> findByStatus(Boolean status);

    // Tìm kiếm mã theo từ khóa chứa chuỗi (dùng cho màn hình quản trị)
    List<Coupon> findByCodeContainingIgnoreCase(String keyword);

    // Đếm số lượt đã sử dụng của một mã giảm giá (loại trừ đơn đã hủy)
    @Query("SELECT COUNT(o.orderId) FROM Order o WHERE o.coupon.couponId = :couponId AND o.status <> 'cancelled'")
    long countUsedByCouponId(@Param("couponId") Integer couponId);
}