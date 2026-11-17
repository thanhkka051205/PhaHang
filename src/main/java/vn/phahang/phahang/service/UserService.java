package vn.phahang.phahang.service;

import org.springframework.stereotype.Service;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.repository.UserRepository;

import java.util.*;

@Service
public class UserService {

    private final UserRepository UserRepository;

    public UserService(UserRepository UserRepository) {
        this.UserRepository = UserRepository;
    }

    // Tạo mới người dùng
    public User handleCreateUser(User user) {
        if (user.getEmail() != null && UserRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        if (user.getPhone() != null && UserRepository.existsByPhone(user.getPhone())) {
            throw new RuntimeException("Phone number already exists: " + user.getPhone());
        }
        return this.UserRepository.save(user);
    }

    // Xóa người dùng
    public void handleDeleteUser(Integer userId) {
        this.UserRepository.deleteById(userId);
    }

    // Tìm người dùng theo id
    public User fetchUserById(Integer userId) {
        return this.UserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    // Lấy tất cả người dùng
    public List<User> fetchAllUsers(){
        return this.UserRepository.findAll();
    }

    // Cập nhật người dùng
    public User handleUpdateUser(User reqUser){
        User currentUser = this.fetchUserById(reqUser.getUserId());
        
        if (currentUser != null) {
            // Kiểm tra Email và số điện thoại mới có tồn tại trong cơ sở dữ liệu hay không trước khi cập nhật
            if (reqUser.getEmail() != null && !reqUser.getEmail().equals(currentUser.getEmail())) {
                if (UserRepository.existsByEmail(reqUser.getEmail())) {
                    throw new RuntimeException("Email already exists: " + reqUser.getEmail());
                }
                currentUser.setEmail(reqUser.getEmail());
            }

            if (reqUser.getPhone() != null && !reqUser.getPhone().equals(currentUser.getPhone())) {
                if (UserRepository.existsByPhone(reqUser.getPhone())) {
                    throw new RuntimeException("Phone number already exists: " + reqUser.getPhone());
                }
                currentUser.setPhone(reqUser.getPhone());
            }

            currentUser.setFullName(reqUser.getFullName());
            currentUser.setRole(reqUser.getRole());
            
            if (reqUser.getPassword() != null && !reqUser.getPassword().isEmpty()) {
                currentUser.setPassword(reqUser.getPassword());
            }

            return this.UserRepository.save(currentUser);
        } else {
            return null;
        }
    }

    public User handleGetUserByUsername(String username) {
        return this.UserRepository.findByEmail(username);
    }
}