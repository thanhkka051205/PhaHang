package vn.phahang.phahang.backend1.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.backend1.domain.ProductImage;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {
    // Lấy danh sách ảnh theo ID sản phẩm
    List<ProductImage> findByProduct_ProductIdOrderBySortOrderAsc(Integer productId);
}
