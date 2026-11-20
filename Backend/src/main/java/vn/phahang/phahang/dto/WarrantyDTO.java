package vn.phahang.phahang.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WarrantyDTO {

    private Integer warrantyId;

    @NotNull(message = "Order item ID không được để trống")
    private Integer orderItemId;

    @NotNull(message = "Ngày bắt đầu bảo hành không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc bảo hành không được để trống")
    private LocalDate endDate;

    private String status;
}