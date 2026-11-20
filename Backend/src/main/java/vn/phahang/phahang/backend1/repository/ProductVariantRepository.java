package vn.phahang.phahang.backend1.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.backend1.domain.ProductVariant;

@Repository 
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    //Lấy danh sách biến thể sản phẩm theo ID sản phẩm
    List<ProductVariant> findByProduct_ProductId(Integer productId); 
    // Lấy giá thấp nhất của sản phẩm
    @Query("SELECT MIN(pv.price) FROM ProductVariant pv WHERE pv.product.productId = :productId")
    BigDecimal findMinPriceByProductId(@Param("productId") Integer productId);
}
