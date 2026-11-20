package vn.phahang.phahang.backend1.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.phahang.phahang.backend1.domain.CartItem;
import vn.phahang.phahang.backend1.dto.CartItemRequestDTO;
import vn.phahang.phahang.backend1.dto.CartItemResponseDTO;
import vn.phahang.phahang.backend1.dto.CartItemUpdateDTO;
import vn.phahang.phahang.backend1.dto.CartResponseDTO;
import vn.phahang.phahang.backend1.service.CartItemService;

@RestController
@RequestMapping("/api/cart")
public class CartItemController {
    private final CartItemService cartItemService;
    public CartItemController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }
    // API Lấy giỏ hàng của người dùng
    // GET //api/cart
    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(Authentication authentication) {
        CartResponseDTO response = cartItemService.getCart(authentication.getName());
        return ResponseEntity.ok(response);
    }

    // API: Thêm sản phẩm vào giỏ hàng
    // POST //api/cart
    @PostMapping
    public ResponseEntity<CartItemResponseDTO> addToCart(Authentication authentication, @Valid @RequestBody CartItemRequestDTO request) {
        CartItem item = cartItemService.addToCart(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartItemService.convertToDTO(item));
    }

    // API: Cập nhật số lượng sản phẩm trong giỏ hàng
    // PUT //api/cart/id
    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemResponseDTO> updateCartItem(Authentication authentication, @PathVariable Integer cartItemId, @Valid @RequestBody CartItemUpdateDTO request) {
        return cartItemService.updateCartItem(authentication.getName(), cartItemId, request)
                .map(cartItem -> ResponseEntity.ok(
                        cartItemService.convertToDTO(cartItem)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Xóa một sản phẩm khỏi giỏ hàng
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> deleteCartItem(Authentication authentication, @PathVariable Integer cartItemId) {
        boolean deleted = cartItemService.deleteCartItem(
                authentication.getName(), cartItemId);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    // Xóa toàn bộ giỏ hàng
    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        cartItemService.clearCart(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
