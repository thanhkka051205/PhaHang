package vn.trungthucmobile.trungthucmobile.repository;

import vn.trungthucmobile.trungthucmobile.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    @Override
    Optional<User> findById(Long id);
    
}