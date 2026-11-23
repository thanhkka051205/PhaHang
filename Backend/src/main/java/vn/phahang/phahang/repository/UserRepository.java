package vn.phahang.phahang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.phahang.phahang.domain.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    User findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}