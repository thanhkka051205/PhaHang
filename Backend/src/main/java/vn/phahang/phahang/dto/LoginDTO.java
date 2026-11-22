package vn.phahang.phahang.dto; 

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import vn.phahang.phahang.domain.User;

@Data
public class LoginDTO {
    @NotBlank(message = "Email is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min=8, message="Password tối thiểu 8 kí tự")
    private String password;
    private User user;

    @JsonProperty("token")
    private String accessToken;
}