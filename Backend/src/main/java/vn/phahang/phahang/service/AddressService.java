package vn.phahang.phahang.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.phahang.phahang.domain.Address;
import vn.phahang.phahang.dto.AddressResponseDTO;
import vn.phahang.phahang.repository.AddressRepository;

@Service
public class AddressService {
    private final AddressRepository addressRepository;
    //Constructor
    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }
    //Lấy tất cả địa chỉ trong bảng ADDRESSES
    public List<Address> getAllAddresses() {
    return addressRepository.findAll();
    }
    //Lấy tất cả địa chỉ theo ID
    public Optional<Address> getAddressById(Integer id) {
        return addressRepository.findById(id);
    }
    //Thêm hoặc cập nhật địa chỉ
    public Address saveAddress(Address address) {
        return addressRepository.save(address);
    }
    //Xoá địa chỉ theo ID
    public void deleteAddress(Integer id) {
        addressRepository.deleteById(id);
    }
    // Lấy danh sách địa chỉ theo ID người dùng
    public List<Address> getAddressesByUserId(Integer userId) {
        // Gọi Repository để tìm địa chỉ theo người dùng
        return addressRepository.findByUser_UserId(userId);
    }
    // Chuyển Address Entity thành AddressResponseDTO
    public AddressResponseDTO convertToDTO(Address address) {
        AddressResponseDTO dto = new AddressResponseDTO();
        dto.setAddressId(address.getAddressId());
        dto.setReceiverName(address.getReceiverName());
        dto.setReceiverPhone(address.getReceiverPhone());
        dto.setAddressDetail(address.getAddressDetail());
        dto.setIsDefault(address.getIsDefault());
        return dto;
    }

}