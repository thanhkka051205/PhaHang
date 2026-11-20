package vn.phahang.phahang.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.phahang.phahang.domain.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findById(Integer userId);

    User findByEmail(String email);
    
    public void deleteById(Integer userId);

    //Kiem tra xem nguoi dung co ton tai hay khong: email, phone, id
    boolean existsById(Integer userId);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
}