package vn.phahang.phahang.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.phahang.phahang.domain.Category;
import vn.phahang.phahang.dto.CategoryResponseDTO;
import vn.phahang.phahang.repository.CategoryRepository;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    //Constructor
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    //Lấy tất cả danh mục trong bảng CATEGORIES
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    //Tìm danh mục theo ID
    public Optional<Category> getCategoryById(Integer id) {
        return categoryRepository.findById(id);
    }
    //Thêm hoặc cập nhật danh mục
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }
    //Xoá danh mục theo ID
    public void deleteCategory(Integer id) {
        categoryRepository.deleteById(id);
    }
    // Chuyển Category Entity thành CategoryResponseDTO
    public CategoryResponseDTO convertToDTO(Category category) {
        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setName(category.getName());
        return dto;
    }
    
}
