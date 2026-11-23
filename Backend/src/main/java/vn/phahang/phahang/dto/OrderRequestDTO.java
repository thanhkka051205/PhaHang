package vn.phahang.phahang.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequestDTO {

    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 100)
    private String receiverName;

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    @Size(max = 15)
    private String receiverPhone;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    @Size(max = 255)
    private String shipAddress;
}
