package vn.phahang.phahang.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.phahang.phahang.domain.OrderItem;
import vn.phahang.phahang.domain.Warranty;
import vn.phahang.phahang.dto.WarrantyDTO;
import vn.phahang.phahang.repository.OrderItemRepository;
import vn.phahang.phahang.repository.WarrantyRepository;

@Service
public class WarrantyService {

    private final WarrantyRepository warrantyRepository;
    private final OrderItemRepository orderItemRepository;

    public WarrantyService(WarrantyRepository warrantyRepository, OrderItemRepository orderItemRepository) {
        this.warrantyRepository = warrantyRepository;
        this.orderItemRepository = orderItemRepository;
    }

    // Tạo mới phiếu bảo hành
    // API = POST /api/warranties
    @Transactional
    public WarrantyDTO createWarranty(WarrantyDTO warrantyDTO) {
        OrderItem orderItem = orderItemRepository.findById(warrantyDTO.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy OrderItem ID: " + warrantyDTO.getOrderItemId()));

        Warranty warranty = new Warranty();
        warranty.setOrderItem(orderItem);
        warranty.setStartDate(warrantyDTO.getStartDate());
        warranty.setEndDate(warrantyDTO.getEndDate());
        warranty.setStatus(warrantyDTO.getStatus() != null ? warrantyDTO.getStatus() : "active");
        warranty.setSerialNo(warrantyDTO.getSerialNo());
        warranty.setCustomerPhone(warrantyDTO.getCustomerPhone());

        Warranty savedWarranty = this.warrantyRepository.save(warranty);
        return toDTO(savedWarranty);
    }

    // Lấy danh sách bảo hành 
    // API = GET /api/warranties
    @Transactional
    public List<WarrantyDTO> getAllWarranties() {
        return warrantyRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Tra cứu bảo hành theo SĐT hoặc Serial
    @Transactional
    public List<WarrantyDTO> lookupWarranties(String customerPhone, String serialNo) {
        List<Warranty> warranties = warrantyRepository.lookupWarranties(customerPhone, serialNo);
        return warranties.stream()
                .map(this::toDTO)
                .toList();
    }

    // Cập nhật thông tin & trạng thái bảo hành
    // API = PUT /api/warranties/{id}
    @Transactional
    public WarrantyDTO updateWarranty(Integer warrantyId, WarrantyDTO warrantyDTO) {
        Warranty currentWarranty = warrantyRepository.findById(warrantyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu bảo hành ID: " + warrantyId));

        if (warrantyDTO.getSerialNo() != null) {
            currentWarranty.setSerialNo(warrantyDTO.getSerialNo());
        }
        currentWarranty.setStartDate(warrantyDTO.getStartDate());
        currentWarranty.setEndDate(warrantyDTO.getEndDate());
        currentWarranty.setStatus(warrantyDTO.getStatus());

        Warranty savedWarranty = warrantyRepository.save(currentWarranty);
        return toDTO(savedWarranty);
    }

    // Xóa phiếu bảo hành
    // API = DELETE /api/warranties/{id}
    @Transactional
    public void deleteWarranty(Integer warrantyId) {
        Warranty currentWarranty = warrantyRepository.findById(warrantyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu bảo hành ID: " + warrantyId));

        warrantyRepository.delete(currentWarranty);
    }

    // Convert Warranty -> WarrantyDTO
    public WarrantyDTO toDTO(Warranty warranty) {
        WarrantyDTO resDTO = new WarrantyDTO();
        resDTO.setWarrantyId(warranty.getWarrantyId());
        resDTO.setStartDate(warranty.getStartDate());
        resDTO.setEndDate(warranty.getEndDate());
        resDTO.setStatus(warranty.getStatus());
        resDTO.setSerialNo(warranty.getSerialNo());

        OrderItem item = warranty.getOrderItem();
        if (item != null) {
            resDTO.setOrderItemId(item.getOrderItemId());

            if (item.getOrder() != null) {
                resDTO.setOrderId(item.getOrder().getOrderId());
                resDTO.setCustomerName(item.getOrder().getReceiverName());
                resDTO.setCustomerPhone(item.getOrder().getReceiverPhone());
            }

            if (item.getProductVariant() != null && item.getProductVariant().getProduct() != null) {
                resDTO.setProductName(item.getProductVariant().getProduct().getName());
            }
        }

        return resDTO;
    }
}
