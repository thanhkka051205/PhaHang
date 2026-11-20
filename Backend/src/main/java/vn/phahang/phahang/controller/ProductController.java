package vn.phahang.phahang.controller;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.phahang.phahang.domain.Product;
import vn.phahang.phahang.dto.ProductDetailResponseDTO;
import vn.phahang.phahang.dto.ProductRequestDTO;
import vn.phahang.phahang.dto.ProductResponseDTO;
import vn.phahang.phahang.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // API: Lấy danh sách sản phẩm có phân trang và lọc
    // GET /api/products?page=0&size=12&sort=asc
    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String spec,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "asc") String sort) {
        Page<ProductResponseDTO> result = productService.getProducts(
                keyword, brand, categoryId, spec, color,
                minPrice, maxPrice, page, size, sort);
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
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer id,
            @Valid @RequestBody ProductRequestDTO request) {

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

    // API: Tìm kiếm sản phẩm
    // GET /api/products/search?keyword=Samsung&page=0&size=12
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponseDTO>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "asc") String sort) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Page<ProductResponseDTO> result = productService.getProducts(
                keyword, null, null, null, null,
                null, null, page, size, sort);
        return ResponseEntity.ok(result);
    }

    // API: Lọc sản phẩm theo nhiều điều kiện
    // GET /api/products/filter?brand=Samsung&categoryId=1&spec=256GB&color=Đen
    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponseDTO>> filterProducts(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String spec,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "asc") String sort) {
        Page<ProductResponseDTO> result = productService.getProducts(
                null, brand, categoryId, spec, color,
                minPrice, maxPrice, page, size, sort);
        return ResponseEntity.ok(result);
    }

    // Xử lý lỗi nghiệp vụ
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}