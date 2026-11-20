package vn.phahang.phahang.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterDTO {
    @NotBlank(message= "Họ và tên không được để trống!")
    private String fullName;

    @NotBlank(message="Email không được để trống!")
    @Email(message="Email không đúng định dạng!")
    private String email;

    @NotBlank(message="Số điện thoại không được để trống!")
    @Size(min=8, message="Password tối thiểu 8 kí tự")
    private String password;

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

}
