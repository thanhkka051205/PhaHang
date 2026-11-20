package vn.phahang.phahang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.phahang.phahang.backend1.domain.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    
}