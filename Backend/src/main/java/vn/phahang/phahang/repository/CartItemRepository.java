package vn.phahang.phahang.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.domain.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    // Lấy tất cả sản phẩm trong giỏ hàng của người dùng
    List<CartItem> findByUser_UserId(Integer userId);
    // Kiểm tra biến thể đã có trong giỏ hàng chưa
    Optional<CartItem> findByUser_UserIdAndProductVariant_VariantId(
            Integer userId, Integer variantId);
    // Tìm một dòng giỏ hàng thuộc đúng người dùng
    Optional<CartItem> findByCartItemIdAndUser_UserId(
            Integer cartItemId, Integer userId);
    // Xóa toàn bộ sản phẩm trong giỏ hàng của người dùng
    void deleteByUser_UserId(Integer userId);
}