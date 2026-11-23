package vn.phahang.phahang.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.domain.ProductVariant;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {

    // Lấy danh sách biến thể sản phẩm theo ID sản phẩm
    List<ProductVariant> findByProduct_ProductId(Integer productId);

    // Lấy giá thấp nhất của sản phẩm
    @Query("SELECT MIN(pv.price) FROM ProductVariant pv WHERE pv.product.productId = :productId")
    BigDecimal findMinPriceByProductId(@Param("productId") Integer productId);

    // Lấy biến thể sản phẩm và khóa bản ghi khi xử lý tồn kho
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.variantId = :variantId")
    Optional<ProductVariant> findByIdForUpdate(@Param("variantId") Integer variantId);
}