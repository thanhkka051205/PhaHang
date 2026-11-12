package vn.phahang.phahang.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.phahang.phahang.domain.RestResponse;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.UserResponseDTO;
import vn.phahang.phahang.service.UserService;
import vn.phahang.phahang.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Tạo user mới
    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<UserResponseDTO>> createUser(@RequestBody User postUser) {
        if (postUser.getPassword() != null && !postUser.getPassword().isEmpty()) {
            postUser.setPassword(this.passwordEncoder.encode(postUser.getPassword()));
        }

        if (postUser.getRole() == null || postUser.getRole().isBlank()) {
            postUser.setRole("CUSTOMER");
        } else {
            postUser.setRole(postUser.getRole().trim().toUpperCase());
        }

        User newUser = this.userService.handleCreateUser(postUser);

        RestResponse<UserResponseDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.CREATED.value());
        res.setData(this.userService.convertToDTO(newUser));
        res.setMessage("Create user thành công!");

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    // 2. Xóa user (Chỉ ADMIN)
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Integer userId) throws IdInvalidException {
        User currentUser = this.userService.fetchUserById(userId);
        if (currentUser == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }
        this.userService.handleDeleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // 3. Xem chi tiết 1 user
    // Admin or UserID moi duoc xem
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or @userSecurity.isOwner(authentication, #userId)")
    public ResponseEntity<UserResponseDTO> fetchUserById(@PathVariable("userId") Integer userId) throws IdInvalidException {
        User user = this.userService.fetchUserById(userId);
        if (user == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }
        return ResponseEntity.ok(this.userService.convertToDTO(user));
    }

    // 4. Lấy danh sách toàn bộ user (Chỉ ADMIN hoặc STAFF)
    @GetMapping("")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<UserResponseDTO>> fetchAllUsers() {
        List<UserResponseDTO> users = this.userService.fetchAllUsers()
                .stream()
                .map(this.userService::convertToDTO)
                .toList();
        return ResponseEntity.ok(users);
    }

    // 5. Cập nhật thông tin user
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #userId)")
    public ResponseEntity<RestResponse<UserResponseDTO>> updateUser(
            @PathVariable("userId") Integer userId,
            @RequestBody User updatedUser) throws IdInvalidException {

        User currentUser = this.userService.fetchUserById(userId);
        if (currentUser == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }

        if (updatedUser.getFullName() != null) {
            currentUser.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getEmail() != null) {
            currentUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPhone() != null) {
            currentUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            currentUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        // Chỉ ADMIN mới được phép thay đổi Role hoặc Status
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            if (updatedUser.getRole() != null && !updatedUser.getRole().isBlank()) {
                currentUser.setRole(updatedUser.getRole().trim().toUpperCase());
            }
            if (updatedUser.getStatus() != null) {
                currentUser.setStatus(updatedUser.getStatus());
            }
        }

        User updated = this.userService.handleUpdateUser(currentUser);

        RestResponse<UserResponseDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.OK.value());
        res.setData(this.userService.convertToDTO(updated));
        res.setMessage("Update user thành công!");

        return ResponseEntity.ok(res);
    }

    // 6. API riêng cho ADMIN đổi nhanh quyền (Role) của user
    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<UserResponseDTO>> changeUserRole(
            @PathVariable("userId") Integer userId,
            @RequestBody Map<String, String> body) throws IdInvalidException {

        User currentUser = this.userService.fetchUserById(userId);
        if (currentUser == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }

        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            throw new IdInvalidException("Role không được để trống.");
        }

        currentUser.setRole(newRole.trim().toUpperCase());
        User updated = this.userService.handleUpdateUser(currentUser);

        RestResponse<UserResponseDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.OK.value());
        res.setData(this.userService.convertToDTO(updated));
        res.setMessage("Cập nhật quyền thành công!");

        return ResponseEntity.ok(res);
    }
}
