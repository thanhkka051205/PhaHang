package vn.trungthucmobile.trungthucmobile.service;

import org.springframework.stereotype.Service;
import vn.trungthucmobile.trungthucmobile.domain.User;
import vn.trungthucmobile.trungthucmobile.repository.UserRepository;
import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Tạo mới người dùng
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User handleCreateUser(User user) {
        return this.userRepository.save(user);
    }

    // Xóa người dùng
    public void handleDeleteUser(Integer userId) {
        this.userRepository.deleteById(userId);
    }

    // Tìm người dùng theo id và tất cả người dùng khác
    public User fetchUserById(Integer userId) {
        Optional<User> userOptional = this.userRepository.findById(userId);
        return userOptional.orElse(null);
    }

    public List<User> fetchAllUsers(){
        return this.userRepository.findAll();
    }

    // Cập nhật người dùng
    public User handleUpdateUser(User reqUser){
        User currentUser = this.fetchUserById(reqUser.getUserId());
        if (currentUser != null) {
            currentUser.setFullname(reqUser.getFullname());
            currentUser.setEmail(reqUser.getEmail());
            currentUser.setPhone(reqUser.getPhone());
            currentUser.setPassword(reqUser.getPassword());
            currentUser.setRole(reqUser.getRole());
            return this.userRepository.save(currentUser);
        }else {
            return null;
        }
    }
}