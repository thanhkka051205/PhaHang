package vn.phahang.phahang.backend1.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.phahang.phahang.backend1.domain.ProductVariant;
import vn.phahang.phahang.backend1.dto.ProductVariantRequestDTO;
import vn.phahang.phahang.backend1.dto.ProductVariantResponseDTO;
import vn.phahang.phahang.backend1.repository.ProductRepository;
import vn.phahang.phahang.backend1.service.ProductVariantService;

@RestController
@RequestMapping("/api/product-variants")
@CrossOrigin(origins = "*")
public class ProductVariantController {
    private final ProductVariantService variantService;
    private final ProductRepository productRepository;

    public ProductVariantController(
            ProductVariantService variantService,
            ProductRepository productRepository) {
        this.variantService = variantService;
        this.productRepository = productRepository;
    }

    // API: Lấy tất cả phiên bản
    // GET /api/product-variants
    @GetMapping
    public ResponseEntity<List<ProductVariantResponseDTO>> getAllVariants() {
        List<ProductVariantResponseDTO> result =
            variantService.getAllVariants().stream()
                .map(variantService::convertToDTO)
                .toList();
        return ResponseEntity.ok(result);
    }

    // API: Lấy phiên bản theo ID
    // GET /api/product-variants/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponseDTO> getVariantById(@PathVariable Integer id) {
        return variantService.getVariantById(id)
            .map(variantService::convertToDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // API: Lấy phiên bản theo sản phẩm
    // GET /api/product-variants/product/{productId}
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getVariantsByProductId(@PathVariable Integer productId) {
        if (!productRepository.existsById(productId)) {
            return ResponseEntity.notFound().build();
        }
        List<ProductVariantResponseDTO> result =
            variantService.getVariantsByProductId(productId).stream()
                .map(variantService::convertToDTO)
                .toList();
        return ResponseEntity.ok(result);
    }

    // API: Thêm phiên bản
    // POST /api/product-variants
    @PostMapping
    public ResponseEntity<?> createVariant(
            @Valid @RequestBody ProductVariantRequestDTO request) {

        try {
            ProductVariant saved = variantService.createVariant(request);
            return ResponseEntity.ok(variantService.convertToDTO(saved));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Cập nhật phiên bản
    // PUT /api/product-variants/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVariant(
            @PathVariable Integer id,
            @Valid @RequestBody ProductVariantRequestDTO request) {

        try {
            return variantService.updateVariant(id, request)
                    .map(variantService::convertToDTO)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Xóa phiên bản
    // DELETE /api/product-variants/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Integer id) {
        if (variantService.getVariantById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        variantService.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }
}
