package vn.phahang.phahang.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.phahang.phahang.domain.Address;

public interface AddressRepository extends JpaRepository<Address, Integer> {
    // Lấy danh sách địa chỉ theo ID người dùng
    List<Address> findByUser_UserId(Integer userId);
}