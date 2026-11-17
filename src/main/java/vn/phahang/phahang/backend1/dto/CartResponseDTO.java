package vn.phahang.phahang.backend1.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartResponseDTO {
    private List<CartItemResponseDTO> items;
    private Integer totalItems;
    private BigDecimal totalAmount;
}
