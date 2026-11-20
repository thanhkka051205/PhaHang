package vn.phahang.phahang.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.phahang.phahang.backend1.domain.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    
}
