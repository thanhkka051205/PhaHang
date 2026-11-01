package vn.trungthucmobile.trungthucmobile.service;

import org.springframework.stereotype.Service;
import vn.trungthucmobile.trungthucmobile.domain.User;
import vn.trungthucmobile.trungthucmobile.repository.UserRepository;
import java.util.*;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User handleCreateUser(User user) {
        return this.userRepository.save(user);
    }

    public void handleDeleteUser(Integer userId) {
        this.userRepository.deleteById(userId);
    }

    public User getUserById(Integer userId) {
        Optional<User> userOptional = this.userRepository.findById(userId);
        return userOptional.orElse(null);
    }

    public List<User> getAllUsers(){
        return this.userRepository.findAll();
    }
}