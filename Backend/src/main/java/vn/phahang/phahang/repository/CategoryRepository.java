package vn.phahang.phahang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.domain.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    // Kiểm tra danh mục có danh mục con hay không
    boolean existsByParentCategory_CategoryId(Integer categoryId);
}
