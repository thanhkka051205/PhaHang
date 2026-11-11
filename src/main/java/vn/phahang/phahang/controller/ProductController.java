package vn.phahang.phahang.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.phahang.phahang.domain.Product;
import vn.phahang.phahang.dto.ProductResponseDTO;
import vn.phahang.phahang.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    // Constructor injection
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // API 7: Lấy tất cả sản phẩm
    // GET /api/products
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        List<ProductResponseDTO> products = productService.getAllProducts()
            .stream()
            .map(productService::convertToDTO)
            .toList();
        return ResponseEntity.ok(products);
    }

    // API 8: Lấy sản phẩm theo ID
    // GET /api/products/1
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Integer id) {
        return productService.getProductById(id)
            .map(productService::convertToDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // API 9: Thêm sản phẩm
    // POST /api/products
    @PostMapping
    public ResponseEntity<ProductResponseDTO> saveProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return ResponseEntity.ok(
            productService.convertToDTO(savedProduct));
    }

    // API 10: Cập nhật sản phẩm
    // PUT /api/products/1
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
        @PathVariable Integer id,
        @RequestBody Product product) {
        return productService.getProductById(id)
                .map(existingProduct -> {
                    existingProduct.setCategory(product.getCategory());
                    existingProduct.setName(product.getName());
                    existingProduct.setBrand(product.getBrand());
                    existingProduct.setDescription(product.getDescription());
                    existingProduct.setWarrantyMonths(product.getWarrantyMonths());
                    existingProduct.setTrackSerial(product.getTrackSerial());
                    existingProduct.setIsVisible(product.getIsVisible());
                    Product updatedProduct = productService.saveProduct(existingProduct);
                    return ResponseEntity.ok(
                            productService.convertToDTO(updatedProduct));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // API 11: Xóa sản phẩm
    // DELETE /api/products/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Integer id) {
        if (productService.getProductById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // API 12: Tìm kiếm sản phẩm theo tên hoặc thương hiệu
    // GET /api/products/search?keyword=iphone
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(
            @RequestParam String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<ProductResponseDTO> products = productService.searchProducts(keyword.trim())
                        .stream()
                        .map(productService::convertToDTO)
                        .toList();
        return ResponseEntity.ok(products);
    }

    // API 13: Lọc sản phẩm theo giá, thương hiệu và danh mục
    // GET /api/products/filter?brand=Apple
    // GET /api/products/filter?categoryId=8
    // GET /api/products/filter?minPrice=10000000&maxPrice=30000000
    @GetMapping("/filter")
    public ResponseEntity<?> filterProducts(
        @RequestParam(required = false) String brand,
        @RequestParam(required = false) Integer categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice) {
        // Kiểm tra giá không được âm
        if ((minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0)
                || (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0)) {
            return ResponseEntity.badRequest()
                    .body("Giá không được âm");
        }
        // Kiểm tra khoảng giá
        if (minPrice != null && maxPrice != null
                && minPrice.compareTo(maxPrice) > 0) {
            return ResponseEntity.badRequest()
                .body("Giá thấp nhất không được lớn hơn giá cao nhất");
        }
        // Chuẩn hóa thương hiệu
        if (brand != null && brand.trim().isEmpty()) {
            brand = null;
        } else if (brand != null) {
            brand = brand.trim();
        }
        // Gọi Service và chuyển sang DTO
        List<ProductResponseDTO> products =
            productService.filterProducts(
                brand, categoryId, minPrice, maxPrice)
                    .stream()
                    .map(productService::convertToDTO)
                    .toList();
        return ResponseEntity.ok(products);
    }
}