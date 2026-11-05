package vn.trungthucmobile.trungthucmobile.repository;

import vn.trungthucmobile.trungthucmobile.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findById(Integer userId);

    public void deleteById(Integer userId);

    //Kiem tra xem nguoi dung co ton tai hay khong: email, phone, id
    boolean existsById(Integer userId);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
}