package vn.phahang.phahang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.phahang.phahang.domain.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    
}