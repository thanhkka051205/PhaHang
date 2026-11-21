package vn.phahang.phahang.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.UserResponseDTO;
import vn.phahang.phahang.repository.UserRepository;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
    public User handleUpdateUser(Integer userId, User reqUser) {
        User currentUser = this.fetchUserById(userId);
        if (currentUser == null) {
            throw new RuntimeException("User ID " + userId + " không tồn tại trong hệ thống.");
        }

        currentUser.setPhone(reqUser.getPhone());
        currentUser.setFullName(reqUser.getFullName());
        currentUser.setStatus(reqUser.getStatus());
        currentUser.setPassword(this.passwordEncoder.encode(reqUser.getPassword()));
        currentUser.setRole(reqUser.getRole().trim().toUpperCase());

        return this.userRepository.save(currentUser);
    }



    public User handleGetUserByUsername(String username) {
    return this.userRepository.findByEmail(username).orElse(null);
    }

    public UserResponseDTO convertToDTO(User user) {
        if (user == null) return null;
        
        UserResponseDTO dto = new UserResponseDTO();
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        return dto;
    }
}
