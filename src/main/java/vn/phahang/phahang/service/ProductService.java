package vn.phahang.phahang.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.phahang.phahang.domain.Product;
import vn.phahang.phahang.dto.ProductResponseDTO;
import vn.phahang.phahang.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    //constructor
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    //Lấy tất cả sản phẩm trong bảng PRODUCTS
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    //Lấy sản phẩm theo ID
     public Optional<Product> getProductById(Integer id) {
        return productRepository.findById(id);
    }
    //Thêm hoặc cập nhật sản phẩm
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
    //Xoá sản phẩm theo ID
    public void deleteProduct(Integer id) {
        productRepository.deleteById(id);
    }
    // Lấy danh sách sản phẩm theo ID danh mục
    public List<Product> getProductsByCategoryId(Integer categoryId) {
        return productRepository.findByCategory_CategoryId(categoryId);
    }
    // Tìm kiếm sản phẩm theo tên hoặc thương hiệu
    public List<Product> searchProducts(String keyword) {
        // Gọi Repository để thực hiện tìm kiếm
        return productRepository.searchProducts(keyword);
    }
    // Lọc sản phẩm theo thương hiệu, danh mục và giá
    public List<Product> filterProducts(
        String brand,
        Integer categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice) {

        // Gọi Repository để lọc sản phẩm
        return productRepository.filterProducts(
            brand,
            categoryId,
            minPrice,
            maxPrice
        );
    }
    public ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
            dto.setProductId(product.getProductId());
            dto.setName(product.getName());
            dto.setBrand(product.getBrand());
            dto.setDescription(product.getDescription());
            dto.setWarrantyMonths(product.getWarrantyMonths());
            dto.setIsVisible(product.getIsVisible());

            if (product.getCategory() != null) {
                dto.setCategoryId(product.getCategory().getCategoryId());
                dto.setCategoryName(product.getCategory().getName());
        }
        return dto;
}

}