package vn.phahang.phahang.controller;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.UserResponseDTO;
import vn.phahang.phahang.service.UserService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Tạo user mới
    @PostMapping("/auth/register")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody User postUser) {
        postUser.setPassword(this.passwordEncoder.encode(postUser.getPassword()));
        User newUser = this.userService.handleCreateUser(postUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(this.userService.convertToDTO(newUser));
    }


    // 2. Xóa user
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer userId) {
        User user = this.userService.fetchUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        this.userService.handleDeleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // 3. Xem chi tiết 1 user
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponseDTO> fetchUserById(@PathVariable("userId") Integer userId) {
        User user = this.userService.fetchUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(this.userService.convertToDTO(user));
    }

    // 4. Lấy danh sách toàn bộ user
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<UserResponseDTO>> fetchAllUsers() {
        List<UserResponseDTO> result = userService.fetchAllUsers().stream()
            .map(userService::convertToDTO)
            .toList();
        return ResponseEntity.ok(result);
    }

    // 5. Cập nhật thông tin user
    @PutMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Integer userId,
            @RequestBody User updatedUser) {

        User updated = this.userService.handleUpdateUser(userId, updatedUser);
        return ResponseEntity.ok(this.userService.convertToDTO(updated));
    }
}