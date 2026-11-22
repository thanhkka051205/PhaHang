package vn.phahang.phahang.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.phahang.phahang.domain.Warranty;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Integer> {

    @Query("SELECT w FROM Warranty w WHERE " +
           "(:customerPhone IS NULL OR :customerPhone = '' OR w.customerPhone = :customerPhone) AND " +
           "(:serialNo IS NULL OR :serialNo = '' OR w.serialNo = :serialNo)")
    List<Warranty> lookupWarranties(
            @Param("customerPhone") String customerPhone,
            @Param("serialNo") String serialNo);
}
