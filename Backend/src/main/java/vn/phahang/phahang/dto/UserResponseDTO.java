package vn.phahang.phahang.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserResponseDTO {

    @NotBlank(message="Nhập họ và tên")
    private String fullName;

    @NotBlank(message="Nhập email")
    private String email;

    @NotBlank(message="Nhập phone")
    private String phone;
}
