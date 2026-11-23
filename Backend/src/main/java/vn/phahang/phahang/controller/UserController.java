package vn.phahang.phahang.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // API Tạo user mới
    @PostMapping("/auth/register")
    public ResponseEntity<UserResponseDTO> handleCreateUser(@Valid @RequestBody User postUser) {
        UserResponseDTO newUser = this.userService.handleCreateUser(postUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    // API Xóa user
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Integer userId) {
        UserResponseDTO user = this.userService.fetchUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        this.userService.handleDeleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // API Xem chi tiết 1 user
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponseDTO> fetchUserById(@PathVariable("userId") Integer userId) {
        UserResponseDTO user = this.userService.fetchUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // API Lấy danh sách toàn bộ user
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<UserResponseDTO>> fetchAllUsers() {
        return ResponseEntity.ok(this.userService.fetchAllUsers());
    }

    // API Cập nhật thông tin user
    @PutMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable("userId") Integer userId,
            @RequestBody User updatedUser) {

        UserResponseDTO updated = this.userService.handleUpdateUser(userId, updatedUser);
        return ResponseEntity.ok(updated);
    }
}
