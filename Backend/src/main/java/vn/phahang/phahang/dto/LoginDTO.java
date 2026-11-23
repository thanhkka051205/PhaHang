package vn.phahang.phahang.dto; 

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class LoginDTO {
    private String username;
    private String password;
    private UserResponseDTO user;
    @JsonProperty("token")
    private String accessToken;
}