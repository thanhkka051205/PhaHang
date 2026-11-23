package vn.phahang.phahang.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.domain.Category;
import vn.phahang.phahang.dto.CategoryRequestDTO;
import vn.phahang.phahang.dto.CategoryResponseDTO;
import vn.phahang.phahang.repository.CategoryRepository;
import vn.phahang.phahang.repository.ProductRepository;

@Service
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    public CategoryService(CategoryRepository categoryRepository,ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    // Lấy tất cả danh mục
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Lấy danh mục theo ID
    public Optional<Category> getCategoryById(Integer id) {
        return categoryRepository.findById(id);
    }

    // Thêm danh mục
    public Category createCategory(CategoryRequestDTO request) {
        Category category = new Category();
        category.setName(request.getName());
        if (request.getParentId() != null) {
            Category parentCategory = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha"));
            category.setParentCategory(parentCategory);
        }
        return categoryRepository.save(category);
    }

    // Cập nhật danh mục
    public Optional<Category> updateCategory(Integer id, CategoryRequestDTO request) {
        return categoryRepository.findById(id).map(category -> {
            category.setName(request.getName());
            if (request.getParentId() != null) {
                Category parentCategory = categoryRepository.findById(request.getParentId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha"));
                // Kiểm tra danh mục không được làm cha của chính nó
                if (parentCategory.getCategoryId().equals(id)) {
                    throw new RuntimeException("Danh mục không thể là danh mục cha của chính nó");
                }
                // Kiểm tra không tạo quan hệ cha-con bị vòng lặp
                Category currentCategory = parentCategory;
                while (currentCategory != null) {
                    if (currentCategory.getCategoryId().equals(id)) {
                        throw new RuntimeException("Không thể tạo quan hệ danh mục bị vòng lặp");
                    }
                    currentCategory = currentCategory.getParentCategory();
                }
                category.setParentCategory(parentCategory);
            } else {
                category.setParentCategory(null);
            }
            return categoryRepository.save(category);
        });
    }

    // Xóa danh mục
    public void deleteCategory(Integer id) {
        // Kiểm tra danh mục có sản phẩm hay không
        if (productRepository.existsByCategory_CategoryId(id)) {
            throw new RuntimeException("Không thể xóa danh mục đang có sản phẩm");
        }
        // Kiểm tra danh mục có danh mục con hay không
        if (categoryRepository.existsByParentCategory_CategoryId(id)) {
            throw new RuntimeException("Không thể xóa danh mục đang có danh mục con");
        }
        categoryRepository.deleteById(id);
    }

    // Chuyển Categorty sang CategoryResponseDTO
    public CategoryResponseDTO convertToDTO(Category category) {
        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setName(category.getName());
        if (category.getParentCategory() != null) {
            dto.setParentId(category.getParentCategory().getCategoryId());
            dto.setParentName(category.getParentCategory().getName());
        }
        return dto;
    }
}