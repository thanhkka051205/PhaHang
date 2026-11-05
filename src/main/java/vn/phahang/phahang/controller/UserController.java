package vn.phahang.phahang.controller;

import vn.phahang.phahang.service.UserService;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import vn.phahang.phahang.domain.User;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import vn.phahang.phahang.service.error.IdInvalidException;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController 
public class UserController {

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;
    
    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User postManUser) {
        String encodedPassword = passwordEncoder.encode(postManUser.getPassword());
        postManUser.setPassword(encodedPassword);
        User createdUser = this.userService.handleCreateUser(postManUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
    
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Integer userId) throws IdInvalidException {
        User currentUser = this.userService.fetchUserById(userId);
        if (currentUser == null) {
            throw new IdInvalidException("User ID " + userId + " kh\u00F4ng t\u1ED3n t\u1EA1i trong h\u1EC7 th\u1ED1ng.");
        }else {
            this.userService.handleDeleteUser(userId);
            return ResponseEntity.noContent().build(); 
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> fetchUserById(@PathVariable("userId") Integer userId) {
        User user = this.userService.fetchUserById(userId);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> fetchAllUsers() {
        List<User> users = this.userService.fetchAllUsers();
        return ResponseEntity.ok(users);    
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable("userId") Integer userId, @RequestBody User updatedUser) {
        updatedUser.setUserId(userId);

        //Lấy mật khẩu mới từ yêu cầu và mã hóa nó trước khi cập nhật
        User currentUser = this.userService.fetchUserById(userId);
        if (currentUser != null) {
            if(updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(updatedUser.getPassword());
                updatedUser.setPassword(encodedPassword);
            } else {
                // Nếu không có mật khẩu mới, giữ nguyên mật khẩu hiện tại
                updatedUser.setPassword(currentUser.getPassword());
            }
        }
        User updated = this.userService.handleUpdateUser(updatedUser);
        return ResponseEntity.ok(updated);
    }
}