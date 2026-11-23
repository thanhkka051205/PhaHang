package vn.phahang.phahang.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vn.phahang.phahang.domain.InventoryLog;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Integer> {
}
