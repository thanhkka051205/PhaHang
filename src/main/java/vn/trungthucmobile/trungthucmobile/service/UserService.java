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
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        if (user.getPhone() != null && userRepository.existsByPhone(user.getPhone())) {
            throw new RuntimeException("Phone number already exists: " + user.getPhone());
        }
        return this.userRepository.save(user);
    }

    // Xóa người dùng
    public void handleDeleteUser(Integer userId) {
        this.userRepository.deleteById(userId);
    }

    // Tìm người dùng theo id
    public User fetchUserById(Integer userId) {
        return this.userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    // Lấy tất cả người dùng
    public List<User> fetchAllUsers(){
        return this.userRepository.findAll();
    }

    // Cập nhật người dùng
    public User handleUpdateUser(User reqUser){
        User currentUser = this.fetchUserById(reqUser.getUserId());
        
        if (currentUser != null) {
            // Kiểm tra Email và số điện thoại mới có tồn tại trong cơ sở dữ liệu hay không trước khi cập nhật
            if (reqUser.getEmail() != null && !reqUser.getEmail().equals(currentUser.getEmail())) {
                if (userRepository.existsByEmail(reqUser.getEmail())) {
                    throw new RuntimeException("Email already exists: " + reqUser.getEmail());
                }
                currentUser.setEmail(reqUser.getEmail());
            }

            if (reqUser.getPhone() != null && !reqUser.getPhone().equals(currentUser.getPhone())) {
                if (userRepository.existsByPhone(reqUser.getPhone())) {
                    throw new RuntimeException("Phone number already exists: " + reqUser.getPhone());
                }
                currentUser.setPhone(reqUser.getPhone());
            }

            currentUser.setFullName(reqUser.getFullName());
            currentUser.setRole(reqUser.getRole());
            
            if (reqUser.getPassword() != null && !reqUser.getPassword().isEmpty()) {
                currentUser.setPassword(reqUser.getPassword());
            }

            return this.userRepository.save(currentUser);
        } else {
            return null;
        }
    }
}