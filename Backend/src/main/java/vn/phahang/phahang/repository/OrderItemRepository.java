package vn.phahang.phahang.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.domain.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    // Lấy danh sách chi tiết sản phẩm của một đơn hàng
    List<OrderItem> findByOrder_OrderId(Integer orderId);
    
}