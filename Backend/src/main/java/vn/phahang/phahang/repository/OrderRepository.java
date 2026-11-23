package vn.phahang.phahang.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import vn.phahang.phahang.domain.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Lấy danh sách đơn hàng của người dùng, sắp xếp mới nhất trước
    List<Order> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);

    // Lấy chi tiết đơn hàng của người dùng
    Optional<Order> findByOrderIdAndUser_UserId(Integer orderId, Integer userId);

    // Tra cứu đơn hàng bằng mã đơn và số điện thoại người nhận
    Optional<Order> findByOrderIdAndReceiverPhone(Integer orderId, String receiverPhone);

    // Lấy danh sách đơn hàng dành cho Admin có lọc và phân trang
    @Query("""
            SELECT o FROM Order o
            WHERE (:status IS NULL OR LOWER(o.status) = LOWER(:status))
            AND (:fromDate IS NULL OR o.createdAt >= :fromDate)
            AND (:toDate IS NULL OR o.createdAt <= :toDate)
            AND (:orderId IS NULL OR o.orderId = :orderId)
            AND (:receiverPhone IS NULL OR o.receiverPhone LIKE CONCAT('%', :receiverPhone, '%'))
            ORDER BY o.createdAt DESC
            """)
    Page<Order> searchAdminOrders(
            @Param("status") String status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("orderId") Integer orderId,
            @Param("receiverPhone") String receiverPhone,
            Pageable pageable);
    // Lấy đơn hàng và khóa bản ghi khi Admin cập nhật trạng thái
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT o FROM Order o WHERE o.orderId = :orderId")
        Optional<Order> findByIdForUpdate(@Param("orderId") Integer orderId);


}