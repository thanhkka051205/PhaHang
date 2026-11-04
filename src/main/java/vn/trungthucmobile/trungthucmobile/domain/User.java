package vn.trungthucmobile.trungthucmobile.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName; 
    @Column(name = "email", length = 100, unique = true, nullable = false)
    private String email;

    @Column(name = "phone", length = 10)
    private String phone;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "role", length = 50)
    private String role = "customer"; 

    @Column(name = "status", length = 10)
    private String status = "active"; 

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}