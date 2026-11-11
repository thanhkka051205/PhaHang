package vn.phahang.phahang.controller;

import vn.phahang.phahang.service.UserService;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import vn.phahang.phahang.domain.RestResponse;
import vn.phahang.phahang.domain.User;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    @PostMapping("")
    public ResponseEntity<RestResponse<Object>> createUser(@RequestBody User postUser) {
        if (postUser.getPassword() != null && !postUser.getPassword().isEmpty()) {
            postUser.setPassword(this.passwordEncoder.encode(postUser.getPassword()));
        }
        
        User newUser = this.userService.handleCreateUser(postUser);
        
        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.CREATED.value());
        res.setData(newUser);
        res.setMessage("Create user thành công!");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }
    
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Integer userId) throws IdInvalidException {
        User currentUser = this.userService.fetchUserById(userId);
        if (currentUser == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }
        this.userService.handleDeleteUser(userId);
        return ResponseEntity.noContent().build(); 
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> fetchUserById(@PathVariable("userId") Integer userId) throws IdInvalidException {
        User user = this.userService.fetchUserById(userId);
        if (user == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("")
    public ResponseEntity<List<User>> fetchAllUsers() {
        List<User> users = this.userService.fetchAllUsers();
        return ResponseEntity.ok(users);    
    }

    @PutMapping("/{userId}")
    public ResponseEntity<RestResponse<Object>> updateUser(@PathVariable("userId") Integer userId, @RequestBody User updatedUser) throws IdInvalidException {
        User currentUser = this.userService.fetchUserById(userId);
        if (currentUser == null) {
            throw new IdInvalidException("User ID " + userId + " không tồn tại trong hệ thống.");
        }

        if (updatedUser.getFullName() != null) currentUser.setFullName(updatedUser.getFullName());
        if (updatedUser.getEmail() != null) currentUser.setEmail(updatedUser.getEmail());
        if (updatedUser.getPhone() != null) currentUser.setPhone(updatedUser.getPhone());
        
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(updatedUser.getPassword());
            currentUser.setPassword(encodedPassword);
        }
        
        User updated = this.userService.handleUpdateUser(currentUser);

        RestResponse<Object> res = new RestResponse<>();
        res.setStatusCode(HttpStatus.OK.value());
        res.setData(updated);
        res.setMessage("Update user thành công!");

        return ResponseEntity.ok(res);
    }

}
