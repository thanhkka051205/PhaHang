package vn.phahang.phahang.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class UserResponseDTO {
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private Boolean status;
    private LocalDateTime createdAt;
}
