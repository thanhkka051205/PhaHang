package vn.phahang.phahang.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.phahang.phahang.domain.Address;
import vn.phahang.phahang.dto.AddressResponseDTO;
import vn.phahang.phahang.repository.UserRepository;
import vn.phahang.phahang.service.AddressService;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    // Constructor injection
    public AddressController(
            AddressService addressService,
            UserRepository userRepository) {
        this.addressService = addressService;
        this.userRepository = userRepository;
    }

    // API 14: Lấy tất cả địa chỉ
    // GET /api/addresses
    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> getAllAddresses() {

        List<AddressResponseDTO> result = addressService.getAllAddresses().stream()
            .map(addressService::convertToDTO)
            .toList();
        return ResponseEntity.ok(result);
    }

    // API 15: Lấy địa chỉ theo ID
    // GET /api/addresses/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> getAddressById(@PathVariable Integer id) {
        return addressService.getAddressById(id)
            .map(addressService::convertToDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // API 16: Thêm địa chỉ mới
    // POST /api/addresses
    @PostMapping
    public ResponseEntity<AddressResponseDTO> createAddress(@RequestBody Address address) {
        Address savedAddress = addressService.saveAddress(address);
        return ResponseEntity.ok(
            addressService.convertToDTO(savedAddress));
    }

    // API 17: Cập nhật địa chỉ
    // PUT /api/addresses/{id}
    @PutMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> updateAddress(
        @PathVariable Integer id,
        @RequestBody Address address) {
        return addressService.getAddressById(id)
            .map(existingAddress -> {
                // Cập nhật tên người nhận
                existingAddress.setReceiverName(
                    address.getReceiverName());
                    // Cập nhật số điện thoại
                    existingAddress.setReceiverPhone(address.getReceiverPhone());
                    // Cập nhật địa chỉ chi tiết
                    existingAddress.setAddressDetail(address.getAddressDetail());
                    // Cập nhật trạng thái mặc định
                    existingAddress.setIsDefault(address.getIsDefault());

                    // Lưu địa chỉ đã cập nhật
                    Address updatedAddress = addressService.saveAddress(existingAddress);
                    // Chuyển sang DTO trước khi trả về
                    return ResponseEntity.ok(
                            addressService.convertToDTO(updatedAddress));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // API 18: Xóa địa chỉ
    // DELETE /api/addresses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Integer id) {
        // Kiểm tra địa chỉ có tồn tại không
        if (addressService.getAddressById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // Xóa địa chỉ
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    // API 19: Lấy danh sách địa chỉ theo người dùng
    // GET /api/addresses/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AddressResponseDTO>> getAddressesByUserId(
            @PathVariable Integer userId) {
        // Kiểm tra người dùng có tồn tại không
        if (userRepository.findById(userId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // Lấy danh sách địa chỉ
        List<AddressResponseDTO> result =
                addressService.getAddressesByUserId(userId).stream()
                        .map(addressService::convertToDTO)
                        .toList();
        return ResponseEntity.ok(result);
    }
}