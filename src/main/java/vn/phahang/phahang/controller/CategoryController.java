package vn.phahang.phahang.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.phahang.phahang.domain.Category;
import vn.phahang.phahang.dto.CategoryResponseDTO;
import vn.phahang.phahang.dto.ProductResponseDTO;
import vn.phahang.phahang.service.CategoryService;
import vn.phahang.phahang.service.ProductService;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService categoryService;
    private final ProductService productService;
    // Constructor
    public CategoryController(CategoryService categoryService,ProductService productService) {
        this.categoryService = categoryService;
        this.productService = productService;
    }

    // API 1: Lấy toàn bộ danh mục
    // GET /api/categories
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        List<CategoryResponseDTO> categories =
                categoryService.getAllCategories()
                    .stream()
                    .map(categoryService::convertToDTO)
                    .toList();
        return ResponseEntity.ok(categories);
    }

    // API 2: Lấy danh mục theo ID
    // GET /api/categories/1
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryId(@PathVariable Integer id) {
        return categoryService.getCategoryById(id)
            .map(categoryService::convertToDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // API 3: Thêm danh mục mới
    // POST /api/categories
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(@RequestBody Category category) {
        Category savedCategory = categoryService.saveCategory(category);
        return ResponseEntity.ok(
            categoryService.convertToDTO(savedCategory));
    }

    // API 4: Cập nhật danh mục
    // PUT /api/categories/1
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable Integer id,@RequestBody Category category) {
        return categoryService.getCategoryById(id)
            .map(existingCategory -> {
                existingCategory.setName(category.getName());
                existingCategory.setParentCategory(
                category.getParentCategory());
                Category updatedCategory =categoryService.saveCategory(existingCategory);
                return ResponseEntity.ok(categoryService.convertToDTO(updatedCategory));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // API 5: Xóa danh mục
    // DELETE /api/categories/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
        @PathVariable Integer id) {
        if (categoryService.getCategoryById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // API 6: Lấy sản phẩm theo danh mục
    // GET /api/categories/1/products
    @GetMapping("/{id}/products")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategoryId(
            @PathVariable Integer id) {
        if (categoryService.getCategoryById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<ProductResponseDTO> products =
                productService.getProductsByCategoryId(id)
                        .stream()
                        .map(productService::convertToDTO)
                        .toList();
        return ResponseEntity.ok(products);
    }
}