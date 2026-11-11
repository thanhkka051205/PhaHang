package vn.phahang.phahang.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.phahang.phahang.domain.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
}
