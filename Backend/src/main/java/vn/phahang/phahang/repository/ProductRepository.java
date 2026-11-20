package vn.phahang.phahang.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.domain.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    // Lấy danh sách sản phẩm theo ID danh mục
    List<Product> findByCategory_CategoryId(Integer categoryId);

    // Kiểm tra danh mục có sản phẩm hay không
    boolean existsByCategory_CategoryId(Integer categoryId);

    // Tìm kiếm sản phẩm theo tên hoặc thương hiệu (giữ phương thức cũ)
    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    // Lọc sản phẩm theo thương hiệu, danh mục và khoảng giá (giữ phương thức cũ)
    @Query(value = """
            SELECT p.*
            FROM products p
            WHERE
                (:brand IS NULL OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
                AND (:categoryId IS NULL OR p.category_id = :categoryId)
                AND (
                    (:minPrice IS NULL AND :maxPrice IS NULL)
                    OR EXISTS (
                        SELECT 1
                        FROM product_variants pv
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
            @Param("maxPrice") BigDecimal maxPrice);

    // Lấy danh sách sản phẩm có phân trang, tìm kiếm và lọc kết hợp
    @Query(value = """
            SELECT p.*
            FROM products p
            WHERE
                p.is_visible = 1
                AND (:keyword IS NULL
                    OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(p.brand, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                AND (:brand IS NULL
                    OR LOWER(COALESCE(p.brand, '')) LIKE LOWER(CONCAT('%', :brand, '%')))
                AND (:categoryId IS NULL
                    OR p.category_id = :categoryId)
                AND EXISTS (
                    SELECT 1
                    FROM product_variants pv
                    WHERE pv.product_id = p.product_id
                    AND (:spec IS NULL
                        OR LOWER(COALESCE(pv.spec, '')) LIKE LOWER(CONCAT('%', :spec, '%')))
                    AND (:color IS NULL
                        OR LOWER(COALESCE(pv.color, '')) LIKE LOWER(CONCAT('%', :color, '%')))
                    AND (:minPrice IS NULL OR pv.price >= :minPrice)
                    AND (:maxPrice IS NULL OR pv.price <= :maxPrice)
                )
            ORDER BY
                CASE WHEN :sortDirection = 'asc' THEN
                    (SELECT MIN(pv2.price)
                     FROM product_variants pv2
                     WHERE pv2.product_id = p.product_id)
                END ASC,
                CASE WHEN :sortDirection = 'desc' THEN
                    (SELECT MIN(pv3.price)
                     FROM product_variants pv3
                     WHERE pv3.product_id = p.product_id)
                END DESC,
                p.product_id ASC
            """,
            countQuery = """
            SELECT COUNT(*)
            FROM products p
            WHERE
                p.is_visible = 1
                AND (:keyword IS NULL
                    OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(p.brand, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
                AND (:brand IS NULL
                    OR LOWER(COALESCE(p.brand, '')) LIKE LOWER(CONCAT('%', :brand, '%')))
                AND (:categoryId IS NULL
                    OR p.category_id = :categoryId)
                AND EXISTS (
                    SELECT 1
                    FROM product_variants pv
                    WHERE pv.product_id = p.product_id
                    AND (:spec IS NULL
                        OR LOWER(COALESCE(pv.spec, '')) LIKE LOWER(CONCAT('%', :spec, '%')))
                    AND (:color IS NULL
                        OR LOWER(COALESCE(pv.color, '')) LIKE LOWER(CONCAT('%', :color, '%')))
                    AND (:minPrice IS NULL OR pv.price >= :minPrice)
                    AND (:maxPrice IS NULL OR pv.price <= :maxPrice)
                )
            """,
            nativeQuery = true)
    Page<Product> findProductsWithFilters(
            @Param("keyword") String keyword,
            @Param("brand") String brand,
            @Param("categoryId") Integer categoryId,
            @Param("spec") String spec,
            @Param("color") String color,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("sortDirection") String sortDirection,
            Pageable pageable);
}