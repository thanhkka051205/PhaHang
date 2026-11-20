package vn.phahang.phahang.dto;

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
