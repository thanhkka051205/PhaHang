package vn.phahang.phahang.backend1.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.phahang.phahang.backend1.domain.Category;
import vn.phahang.phahang.backend1.dto.CategoryRequestDTO;
import vn.phahang.phahang.backend1.dto.CategoryResponseDTO;
import vn.phahang.phahang.backend1.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService categoryService;
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // API: Lấy tất cả danh mục
    // GET /api/categories
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        List<CategoryResponseDTO> result =
                categoryService.getAllCategories().stream()
                        .map(categoryService::convertToDTO)
                        .toList();
        return ResponseEntity.ok(result);
    }

    // API: Lấy danh mục theo ID
    // GET /api/categories/{id}
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable Integer id) {
        return categoryService.getCategoryById(id)
                .map(categoryService::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Thêm danh mục
    // POST /api/categories
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequestDTO request) {
        Category savedCategory = categoryService.createCategory(request);
        return ResponseEntity.ok(
                categoryService.convertToDTO(savedCategory));
    }

    // API: Cập nhật danh mục
    // PUT /api/categories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Integer id,@Valid @RequestBody CategoryRequestDTO request) {
        return categoryService.updateCategory(id, request)
                .map(categoryService::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Xóa danh mục
    // DELETE /api/categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        if (categoryService.getCategoryById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // Xử lý lỗi nghiệp vụ
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}