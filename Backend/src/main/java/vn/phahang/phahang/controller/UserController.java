package vn.phahang.phahang.controller;

import java.util.Map;
import java.util.Set;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.phahang.phahang.domain.RestResponse;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.ResultPaginationalDTO;
import vn.phahang.phahang.dto.UserResponseDTO;
import vn.phahang.phahang.service.UserService;
import vn.phahang.phahang.util.error.IdInvalidException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private static final Set<String> VALID_ROLES = Set.of("ADMIN", "STAFF", "CUSTOMER");

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Tạo user mới
    @PostMapping("/auth/register")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<UserResponseDTO>> createUser(@Valid @RequestBody User postUser) throws IdInvalidException {
        if (postUser.getEmail() == null || postUser.getEmail().isBlank()) {
            throw new IdInvalidException("Email không được để trống.");
        }
        if (postUser.getPassword() == null || postUser.getPassword().isBlank()) {
            throw new IdInvalidException("Mật khẩu không được để trống.");
        }
        postUser.setPassword(this.passwordEncoder.encode(postUser.getPassword()));

        String role = (postUser.getRole() == null || postUser.getRole().isBlank())
                ? "CUSTOMER"
                : postUser.getRole().trim().toUpperCase();

        if (!VALID_ROLES.contains(role)) {
            throw new IdInvalidException("Role không hợp lệ. Chỉ chấp nhận: ADMIN, STAFF, CUSTOMER.");
        }
        postUser.setRole(role);

        User newUser = this.userService.handleCreateUser(postUser);

        RestResponse<UserResponseDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.CREATED.value());
        res.setData(this.userService.convertToDTO(newUser));
        res.setMessage("Create user thành công!");

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    // 2. Xóa user (Chỉ ADMIN)
    // Trong deleteUser:
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("userId") Integer userId,
            Authentication authentication) throws IdInvalidException {
        User currentUser = this.userService.fetchUserById(userId);
        if (currentUser == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }
        if (currentUser.getEmail().equals(authentication.getName())) {
            throw new IdInvalidException("Không thể tự xóa tài khoản Admin đang đăng nhập.");
        }
        this.userService.handleDeleteUser(userId);
        return ResponseEntity.noContent().build();
    }


    // 3. Xem chi tiết 1 user
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or @userSecurity.isOwner(authentication, #userId)")
    public ResponseEntity<RestResponse<UserResponseDTO>> fetchUserById(@PathVariable("userId") Integer userId) throws IdInvalidException {
        User user = this.userService.fetchUserById(userId);
        if (user == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }

        RestResponse<UserResponseDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.OK.value());
        res.setData(this.userService.convertToDTO(user));
        res.setMessage("Fetch user thành công!");
        return ResponseEntity.ok(res);
    }

    // 4. Lấy danh sách toàn bộ user
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ResultPaginationalDTO> fetchAllUsers(
            @RequestParam("current") Optional<String> currentOptional,
            @RequestParam("pageSize") Optional<String> pageSizeOptional) {

        String sCurrent = currentOptional.isPresent() ? currentOptional.get() : "";
        String sPageSize = pageSizeOptional.isPresent() ? pageSizeOptional.get() : "";

        int current = Integer.parseInt(sCurrent);
        int pageSize = Integer.parseInt(sPageSize);

        Pageable pageable = PageRequest.of(current - 1, pageSize);

        return ResponseEntity.status(HttpStatus.OK).body(this.userService.fetchAllUsers(pageable));
    }

    // 5. Cập nhật thông tin user (Không ghi đè lên currentUser ở Controller để Service check trùng Email/SĐT)
    @PutMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #userId)")
    public ResponseEntity<RestResponse<UserResponseDTO>> updateUser(
            @PathVariable("userId") Integer userId,
            @RequestBody User updatedUser,
            Authentication authentication) throws IdInvalidException {

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            updatedUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin && updatedUser.getRole() != null && !updatedUser.getRole().isBlank()) {
            String normalizedRole = updatedUser.getRole().trim().toUpperCase();
            if (!VALID_ROLES.contains(normalizedRole)) {
                throw new IdInvalidException("Role không hợp lệ.");
            }
            updatedUser.setRole(normalizedRole);
        }

        User updated = this.userService.handleUpdateUser(userId, updatedUser, isAdmin);

        RestResponse<UserResponseDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.OK.value());
        res.setData(this.userService.convertToDTO(updated));
        res.setMessage("Update user thành công!");

        return ResponseEntity.ok(res);
    }

    // 6. API riêng cho ADMIN đổi nhanh quyền (Role) của user
    @PatchMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<UserResponseDTO>> changeUserRole(
            @PathVariable("userId") Integer userId,
            @RequestBody Map<String, String> body) throws IdInvalidException {

        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            throw new IdInvalidException("Role không được để trống.");
        }

        String normalizedRole = newRole.trim().toUpperCase();
        if (!VALID_ROLES.contains(normalizedRole)) {
            throw new IdInvalidException("Role không hợp lệ. Chỉ chấp nhận: ADMIN, STAFF, CUSTOMER.");
        }

        User reqUser = new User();
        reqUser.setRole(normalizedRole);

        User updated = this.userService.handleUpdateUser(userId, reqUser, true);

        RestResponse<UserResponseDTO> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.OK.value());
        res.setData(this.userService.convertToDTO(updated));
        res.setMessage("Cập nhật quyền thành công!");

        return ResponseEntity.ok(res);
    }
}
