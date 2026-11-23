package vn.phahang.phahang.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import vn.phahang.phahang.domain.ProductImage;
import vn.phahang.phahang.dto.ProductImageRequestDTO;
import vn.phahang.phahang.dto.ProductImageResponseDTO;
import vn.phahang.phahang.service.ProductImageService;

@RestController
@RequestMapping("/api/product-images")
public class ProductImageController {
    private final ProductImageService imageService;
    public ProductImageController(ProductImageService imageService) {
        this.imageService = imageService;
    }

    // API: Lấy tất cả ảnh
    // GET /api/product-images
    @GetMapping
    public ResponseEntity<List<ProductImageResponseDTO>> getAllImages() {
        List<ProductImageResponseDTO> images = imageService.getAllImages()
                .stream()
                .map(imageService::convertToDTO)
                .toList();
        return ResponseEntity.ok(images);
    }

    // API: Lấy ảnh theo ID
    // GET /api/product-images/id/{id}
    @GetMapping("/id/{id}")
    public ResponseEntity<ProductImageResponseDTO> getImageById(@PathVariable Integer id) {
        return imageService.getImageById(id)
                .map(imageService::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Lấy danh sách ảnh theo sản phẩm
    // GET /api/product-images/product/{productId}
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImageResponseDTO>> getImagesByProductId(@PathVariable Integer productId) {
        List<ProductImageResponseDTO> images = imageService
                .getImagesByProductId(productId)
                .stream()
                .map(imageService::convertToDTO)
                .toList();
        return ResponseEntity.ok(images);
    }

    // API: Upload một ảnh
    // POST /api/product-images/upload
    @PostMapping(value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImageResponseDTO> uploadImage(
            @RequestParam("productId") Integer productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sortOrder", required = false) Integer sortOrder) {
        ProductImage image = imageService.uploadImage(productId, file, sortOrder);
        return ResponseEntity.ok(imageService.convertToDTO(image));
    }

    // API: Upload nhiều ảnh
    // POST /api/product-images/upload-multiple
    @PostMapping(value = "/upload-multiple",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ProductImageResponseDTO>> uploadMultipleImages(
            @RequestParam("productId") Integer productId,
            @RequestParam("files") List<MultipartFile> files) {
        List<ProductImage> images = imageService.uploadMultipleImages(productId, files);
        List<ProductImageResponseDTO> response = images.stream()
                .map(imageService::convertToDTO)
                .toList();
        return ResponseEntity.ok(response);
    }

    // API: Thêm ảnh bằng đường dẫn có sẵn
    // POST /api/product-images
    @PostMapping
    public ResponseEntity<ProductImageResponseDTO> createImage(@Valid @RequestBody ProductImageRequestDTO request) {
        ProductImage image = imageService.createImage(request);
        return ResponseEntity.ok(imageService.convertToDTO(image));
    }

    // API: Cập nhật thông tin ảnh
    // PUT /api/product-images/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ProductImageResponseDTO> updateImage(@PathVariable Integer id, @Valid @RequestBody ProductImageRequestDTO request) {
        return imageService.updateImage(id, request)
                .map(imageService::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Xóa ảnh
    // DELETE /api/product-images/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Integer id) {
        if (imageService.getImageById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        imageService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}