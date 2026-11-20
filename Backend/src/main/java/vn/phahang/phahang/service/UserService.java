package vn.phahang.phahang.service;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.Meta;
import vn.phahang.phahang.dto.UserResponseDTO;
import vn.phahang.phahang.repository.UserRepository;
import vn.phahang.phahang.util.error.IdInvalidException;
import vn.phahang.phahang.dto.ResultPaginationalDTO;

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
    public ResultPaginationalDTO fetchAllUsers(Pageable pageable){
        Page<User> pageUser = this.userRepository.findAll(pageable);
        ResultPaginationalDTO rs = new ResultPaginationalDTO();
        Meta mt = new Meta();

        mt.setPage(pageUser.getNumber() + 1);
        mt.setPageSize(pageUser.getSize());

        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(pageUser.getContent());

        return rs;
    }

    // Cập nhật người dùng
    public User handleUpdateUser(Integer userId, User reqUser, boolean isAdmin) throws IdInvalidException {
        User currentUser = this.fetchUserById(userId);
        if (currentUser == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }

        // Kiểm tra Email mới có trùng không
        if (reqUser.getEmail() != null && !reqUser.getEmail().equals(currentUser.getEmail())) {
            if (userRepository.existsByEmail(reqUser.getEmail())) {
                throw new IdInvalidException("Email đã tồn tại: " + reqUser.getEmail());
            }
            currentUser.setEmail(reqUser.getEmail());
        }

        // Kiểm tra Số điện thoại mới có trùng không
        if (reqUser.getPhone() != null && !reqUser.getPhone().equals(currentUser.getPhone())) {
            if (userRepository.existsByPhone(reqUser.getPhone())) {
                throw new IdInvalidException("Số điện thoại đã tồn tại: " + reqUser.getPhone());
            }
            currentUser.setPhone(reqUser.getPhone());
        }

        if (reqUser.getFullName() != null) {
            currentUser.setFullName(reqUser.getFullName());
        }
        if (reqUser.getPassword() != null && !reqUser.getPassword().isEmpty()) {
            currentUser.setPassword(reqUser.getPassword());
        }

        // Chỉ ADMIN mới được đổi Role và Status
        if (isAdmin) {
            if (reqUser.getRole() != null && !reqUser.getRole().isBlank()) {
                currentUser.setRole(reqUser.getRole().trim().toUpperCase());
            }
            if (reqUser.getStatus() != null) {
                currentUser.setStatus(reqUser.getStatus());
            }
        }

        return this.userRepository.save(currentUser);
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
