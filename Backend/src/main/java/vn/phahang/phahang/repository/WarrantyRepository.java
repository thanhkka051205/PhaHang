package vn.phahang.phahang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.phahang.phahang.domain.Warranty;

public interface WarrantyRepository extends JpaRepository<Warranty, Integer>{
}
