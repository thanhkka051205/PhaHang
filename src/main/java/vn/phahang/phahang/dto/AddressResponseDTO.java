package vn.phahang.phahang.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressResponseDTO {
    private Integer addressId;
    private String receiverName;
    private String receiverPhone;
    private String addressDetail;
    private Boolean isDefault;
}