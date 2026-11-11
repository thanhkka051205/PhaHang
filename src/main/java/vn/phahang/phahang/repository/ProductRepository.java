package vn.phahang.phahang.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.domain.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    // Lấy danh sách sản phẩm theo ID danh mục
    List<Product> findByCategory_CategoryId(Integer categoryId);
    // Tìm kiếm sản phẩm theo tên hoặc thương hiệu
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    // API lọc sản phẩm theo thương hiệu, danh mục và khoảng giá
    @Query(value = """
        SELECT p.*
        FROM PRODUCTS p
        WHERE
            (:brand IS NULL OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
            AND
            (:categoryId IS NULL OR p.category_id = :categoryId)
            AND
            (
                (:minPrice IS NULL AND :maxPrice IS NULL)
                OR EXISTS (
                    SELECT 1
                    FROM PRODUCT_VARIANTS pv
                    WHERE pv.product_id = p.product_id
                    AND (:minPrice IS NULL OR pv.price >= :minPrice)
                    AND (:maxPrice IS NULL OR pv.price <= :maxPrice)
                )
            )
    """, nativeQuery = true)
    List<Product> filterProducts(
        @Param("brand") String brand,
    @Param("categoryId") Integer categoryId,
    @Param("minPrice") BigDecimal minPrice,
    @Param("maxPrice") BigDecimal maxPrice
);
    
}