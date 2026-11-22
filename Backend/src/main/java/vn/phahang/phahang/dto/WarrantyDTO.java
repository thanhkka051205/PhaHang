package vn.phahang.phahang.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class WarrantyDTO {
    private Integer warrantyId;
    private Integer orderItemId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    private String serialNo; 
    private String productName; 
    private Integer orderId; 
    private String customerName; 
    private String customerPhone;  
}
