package vn.phahang.phahang.backend1.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.phahang.phahang.backend1.domain.Product;
import vn.phahang.phahang.backend1.dto.ProductRequestDTO;
import vn.phahang.phahang.backend1.dto.ProductResponseDTO;
import vn.phahang.phahang.backend1.dto.ProductDetailResponseDTO;
import vn.phahang.phahang.backend1.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // API: Lấy tất cả sản phẩm
    // GET /api/products
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        List<ProductResponseDTO> result = productService.getAllProducts().stream()
            .map(productService::convertToDTO)
            .toList();
        return ResponseEntity.ok(result);
    }

    // API: Lấy sản phẩm theo ID
    // GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Integer id) {
        return productService.getProductById(id)
                .map(productService::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Lấy chi tiết sản phẩm
    // GET /api/products/{id}/detail
    @GetMapping("/{id}/detail")
    public ResponseEntity<ProductDetailResponseDTO> getProductDetail(@PathVariable Integer id) {
    return productService.getProductById(id)
            .map(productService::convertToDetailDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

    // API: Thêm sản phẩm
    // POST /api/products
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequestDTO request) {
        Product saved = productService.createProduct(request);
        return ResponseEntity.ok(productService.convertToDTO(saved));
    }

    // API: Cập nhật sản phẩm
    // PUT /api/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id, @Valid @RequestBody ProductRequestDTO request) {

        return productService.updateProduct(id, request)
                .map(productService::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Xóa sản phẩm
    // DELETE /api/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        if (!productService.existsProduct(id)) {
            return ResponseEntity.notFound().build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // API: Tìm kiếm sản phẩm theo tên hoặc thương hiệu
    // GET /api/products/search?keyword=Samsung
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(@RequestParam String keyword) {
        if (keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<ProductResponseDTO> result =
                productService.searchProducts(keyword.trim()).stream()
                        .map(productService::convertToDTO)
                        .toList();
        return ResponseEntity.ok(result);
    }

    // API: Lọc sản phẩm theo giá, thương hiệu và danh mục
    // GET /api/products/filter
    @GetMapping("/filter")
    public ResponseEntity<?> filterProducts(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        // Kiểm tra giá không được âm
        if ((minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0)
                || (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0)) {
            return ResponseEntity.badRequest().body("Giá không được âm");
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
        List<ProductResponseDTO> result = productService.filterProducts(brand, categoryId, minPrice, maxPrice)
                        .stream()
                        .map(productService::convertToDTO)
                        .toList();
        return ResponseEntity.ok(result);
    }

    // Xử lý lỗi nghiệp vụ
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}