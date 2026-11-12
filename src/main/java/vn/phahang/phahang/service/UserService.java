package vn.phahang.phahang.service;

import org.springframework.stereotype.Service;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.UserResponseDTO;
import vn.phahang.phahang.repository.UserRepository;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Tạo mới người dùng
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
        return this.userRepository.findById(userId).orElse(null);
    }

    // Lấy tất cả người dùng
    public List<User> fetchAllUsers() {
        return this.userRepository.findAll();
    }

    // Cập nhật người dùng
    public User handleUpdateUser(User reqUser) {
        User currentUser = this.fetchUserById(reqUser.getUserId());
        
        if (currentUser != null) {
            // Kiểm tra Email mới có trùng không
            if (reqUser.getEmail() != null && !reqUser.getEmail().equals(currentUser.getEmail())) {
                if (userRepository.existsByEmail(reqUser.getEmail())) {
                    throw new RuntimeException("Email already exists: " + reqUser.getEmail());
                }
                currentUser.setEmail(reqUser.getEmail());
            }

            // Kiểm tra Số điện thoại mới có trùng không
            if (reqUser.getPhone() != null && !reqUser.getPhone().equals(currentUser.getPhone())) {
                if (userRepository.existsByPhone(reqUser.getPhone())) {
                    throw new RuntimeException("Phone number already exists: " + reqUser.getPhone());
                }
                currentUser.setPhone(reqUser.getPhone());
            }

            if (reqUser.getFullName() != null) {
                currentUser.setFullName(reqUser.getFullName());
            }
            if (reqUser.getRole() != null) {
                currentUser.setRole(reqUser.getRole());
            }
            if (reqUser.getStatus() != null) {
                currentUser.setStatus(reqUser.getStatus());
            }
            if (reqUser.getPassword() != null && !reqUser.getPassword().isEmpty()) {
                currentUser.setPassword(reqUser.getPassword());
            }

            return this.userRepository.save(currentUser);
        }
        return null;
    }

    public User handleGetUserByUsername(String username) {
        return this.userRepository.findByEmail(username);
    }

    public UserResponseDTO convertToDTO(User user) {
        if (user == null) return null;
        return new UserResponseDTO(
            user.getUserId(),
            user.getEmail(),//Dung email lam username login
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getStatus(),
            user.getCreatedAt()
        );
    }
}
