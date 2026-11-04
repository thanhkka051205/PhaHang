package vn.trungthucmobile.trungthucmobile.controller;

import vn.trungthucmobile.trungthucmobile.service.UserService;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import vn.trungthucmobile.trungthucmobile.domain.User;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import vn.trungthucmobile.trungthucmobile.service.error.IdInvalidException;

@RestController 
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User postManUser) {
        User createdUser = this.userService.handleCreateUser(postManUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
    
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Long userId) throws IdInvalidException {
        if(userId>=1500){
            throw new IdInvalidException("User ID is invalid. It must be less than 1500.");
        }
        this.userService.handleDeleteUser(userId);
        return ResponseEntity.noContent().build(); 
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> fetchUserById(@PathVariable("userId") Long userId) {
        User user = this.userService.fetchUserById(userId);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> fetchAllUsers() {
        List<User> users = this.userService.fetchAllUsers();
        return ResponseEntity.ok(users);    
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable("userId") Long userId, @RequestBody User updatedUser) {
        updatedUser.setUserId(userId);
        User updated = this.userService.handleUpdateUser(updatedUser);
        return ResponseEntity.ok(updated);
    }
}