package vn.phahang.phahang.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public UserResponseDTO handleCreateUser(User user) {
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        if (user.getPhone() != null && userRepository.existsByPhone(user.getPhone())) {
            throw new RuntimeException("Phone number already exists: " + user.getPhone());
        }

        user.setPassword(this.passwordEncoder.encode(user.getPassword()));

        this.userRepository.save(user);
        return convertToDTO(user);
    }

    // Xóa người dùng
    @Transactional
    public void handleDeleteUser(Integer userId) {
        if (!this.userRepository.existsById(userId)) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + userId);
        }
        this.userRepository.deleteById(userId);
    }

    // Tìm người dùng theo id
    @Transactional
    public UserResponseDTO fetchUserById(Integer userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(()->new RuntimeException("Không tìm thấy người dùng"));
        return convertToDTO(user);
    }

    // Lấy tất cả người dùng
    @Transactional
    public List<UserResponseDTO> fetchAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .toList();
    }

    // Cập nhật người dùng
    @Transactional
    public UserResponseDTO handleUpdateUser(Integer userId, User reqUser) {
        User currentUser = this.userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        currentUser.setPhone(reqUser.getPhone());
        currentUser.setFullName(reqUser.getFullName());
        currentUser.setStatus(reqUser.getStatus());
        currentUser.setEmail(reqUser.getEmail());
        currentUser.setPassword(this.passwordEncoder.encode(reqUser.getPassword()));
        currentUser.setRole(reqUser.getRole().trim().toUpperCase());

        User savedUser = this.userRepository.save(currentUser);
        return convertToDTO(savedUser);
    }

    //Tìm người dùng theo username (email)
    @Transactional
    public UserResponseDTO handleGetUserByUsername(String username) {
        User currentUser = this.userRepository.findByEmail(username);
        if (currentUser == null) {
            throw new RuntimeException("Không tìm thấy người dùng: " + username);
        }
        return convertToDTO(currentUser);
    }

    public UserResponseDTO convertToDTO(User user) {
        if (user == null) return null;
        
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        String role = user.getRole();
        dto.setRole(role == null ? null : role.trim().toUpperCase());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}