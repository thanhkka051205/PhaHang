package vn.phahang.phahang.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.domain.CartItem;
import vn.phahang.phahang.domain.ProductImage;
import vn.phahang.phahang.domain.ProductVariant;
import vn.phahang.phahang.domain.User;
import vn.phahang.phahang.dto.CartItemRequestDTO;
import vn.phahang.phahang.dto.CartItemResponseDTO;
import vn.phahang.phahang.dto.CartItemUpdateDTO;
import vn.phahang.phahang.dto.CartResponseDTO;
import vn.phahang.phahang.repository.CartItemRepository;
import vn.phahang.phahang.repository.ProductImageRepository;
import vn.phahang.phahang.repository.ProductVariantRepository;
import vn.phahang.phahang.repository.UserRepository;

@Service
public class CartItemService {
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final UserRepository userRepository;
    public CartItemService(CartItemRepository cartItemRepository, ProductVariantRepository variantRepository, ProductImageRepository imageRepository,UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
    }

    // Lấy giỏ hàng của người dùng
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(String email) {
        User user = getUserByEmail(email);
        List<CartItem> cartItems =
                cartItemRepository.findByUser_UserId(user.getUserId());
        List<CartItemResponseDTO> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            CartItemResponseDTO dto = convertToDTO(item);
            items.add(dto);
            totalAmount = totalAmount.add(dto.getSubtotal());
        }
        CartResponseDTO response = new CartResponseDTO();
        response.setItems(items);
        response.setTotalItems(items.size());
        response.setTotalAmount(totalAmount);
        return response;
    }

    // Thêm sản phẩm vào giỏ hàng
    @Transactional
    public CartItem addToCart(String email, CartItemRequestDTO request) {
        User user = getUserByEmail(email);
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm"));
        // Kiểm tra sản phẩm có đang được hiển thị không
        if (!Boolean.TRUE.equals(variant.getProduct().getIsVisible())) {
            throw new RuntimeException("Sản phẩm hiện không được kinh doanh");
        }
        // Kiểm tra tồn kho
        Integer stockQty = variant.getStockQty();
        if (stockQty == null || stockQty <= 0) {
            throw new RuntimeException("Sản phẩm đã hết hàng");
        }
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new RuntimeException("Số lượng phải lớn hơn hoặc bằng 1");
        }
        // Kiểm tra biến thể đã có trong giỏ hàng chưa
        Optional<CartItem> existingItem =
                cartItemRepository.findByUser_UserIdAndProductVariant_VariantId(
                        user.getUserId(), variant.getVariantId());
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > stockQty) {
                throw new RuntimeException("Chỉ còn " + stockQty + " sản phẩm");
            }
            item.setQuantity(newQuantity);
            return cartItemRepository.save(item);
        }
        // Nếu chưa có thì tạo dòng giỏ hàng mới
        if (request.getQuantity() > stockQty) {
            throw new RuntimeException("Chỉ còn " + stockQty + " sản phẩm");
        }
        CartItem item = new CartItem();
        item.setUser(user);
        item.setProductVariant(variant);
        item.setQuantity(request.getQuantity());
        return cartItemRepository.save(item);
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    @Transactional
    public Optional<CartItem> updateCartItem(
            String email, Integer cartItemId, CartItemUpdateDTO request) {
        User user = getUserByEmail(email);
        return cartItemRepository
                .findByCartItemIdAndUser_UserId(cartItemId, user.getUserId())
                .map(item -> {
                    Integer quantity = request.getQuantity();
                    Integer stockQty = item.getProductVariant().getStockQty();
                    if (quantity == null || quantity < 1) {
                        throw new RuntimeException(
                                "Số lượng phải lớn hơn hoặc bằng 1");
                    }
                    if (stockQty == null || quantity > stockQty) {
                        throw new RuntimeException(
                                "Chỉ còn " + (stockQty == null ? 0 : stockQty)
                                        + " sản phẩm");
                    }
                    item.setQuantity(quantity);
                    return cartItemRepository.save(item);
                });
    }

    // Xóa một sản phẩm khỏi giỏ hàng
    @Transactional
    public boolean deleteCartItem(String email, Integer cartItemId) {

        User user = getUserByEmail(email);

        Optional<CartItem> item =
                cartItemRepository.findByCartItemIdAndUser_UserId(
                        cartItemId, user.getUserId());

        if (item.isEmpty()) {
            return false;
        }

        cartItemRepository.delete(item.get());

        return true;
    }

    // Xóa toàn bộ giỏ hàng
    @Transactional
    public void clearCart(String email) {

        User user = getUserByEmail(email);

        cartItemRepository.deleteByUser_UserId(user.getUserId());
    }

    // Chuyển CartItem thành CartItemResponseDTO
    @Transactional(readOnly = true)
    public CartItemResponseDTO convertToDTO(CartItem item) {
        ProductVariant variant = item.getProductVariant();
        CartItemResponseDTO dto = new CartItemResponseDTO();
        dto.setCartItemId(item.getCartItemId());
        dto.setVariantId(variant.getVariantId());
        dto.setProductId(variant.getProduct().getProductId());
        dto.setProductName(variant.getProduct().getName());
        dto.setSpec(variant.getSpec());
        dto.setColor(variant.getColor());
        dto.setPrice(variant.getPrice());
        dto.setQuantity(item.getQuantity());
        // Tính thành tiền của một dòng sản phẩm
        dto.setSubtotal(
                variant.getPrice().multiply(
                        BigDecimal.valueOf(item.getQuantity())));
        dto.setStockQty(variant.getStockQty());
        dto.setIsVisible(variant.getProduct().getIsVisible());
        // Lấy ảnh đầu tiên của sản phẩm
        List<ProductImage> images =
                imageRepository.findByProduct_ProductIdOrderBySortOrderAsc(
                        variant.getProduct().getProductId());

        if (!images.isEmpty()) {
            dto.setImage(images.get(0).getImagePath());
        }
        return dto;
    }

    // Tìm người dùng thông qua email trong JWT
    private User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            throw new RuntimeException("Không tìm thấy người dùng");
        }
        return user;
    }
}
