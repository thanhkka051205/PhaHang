package vn.phahang.phahang.service;

import java.util.List;

import org.springframework.stereotype.Service;

import vn.phahang.phahang.domain.Order;
import vn.phahang.phahang.domain.OrderItem;
import vn.phahang.phahang.domain.Warranty;
import vn.phahang.phahang.dto.WarrantyDTO;
import vn.phahang.phahang.repository.OrderItemRepository;
import vn.phahang.phahang.repository.WarrantyRepository;
import org.springframework.transaction.annotation.Transactional;

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
    public WarrantyDTO createWarranty(WarrantyDTO warrantyDTO) {
        OrderItem orderItem = orderItemRepository.findById(warrantyDTO.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy OrderItem"));

        Warranty warranty = new Warranty();
        warranty.setOrderItem(orderItem);
        warranty.setStartDate(warrantyDTO.getStartDate());
        warranty.setEndDate(warrantyDTO.getEndDate());
        warranty.setStatus(warrantyDTO.getStatus());

        Warranty savedWarranty = this.warrantyRepository.save(warranty);

        return toDTO(savedWarranty);
    }

    // Tra cứu bảo hành theo ID
    // API = GET /api/warranties/id
    @Transactional
    public WarrantyDTO getWarrantyById(Integer warrantyId) {
        Warranty currentWarranty = warrantyRepository.findById(warrantyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu bảo hành ID: " + warrantyId));

        return toDTO(currentWarranty);
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

    //Cập nhật trang thái bảo hành
    // API = PUT /api/warranties/id
    public WarrantyDTO updateWarranty(Integer warrantyId, WarrantyDTO warrantyDTO){
        Warranty currentWarranty = warrantyRepository.findById(warrantyId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu bảo hành ID: " + warrantyId));

        currentWarranty.setStartDate(warrantyDTO.getStartDate());
        currentWarranty.setEndDate(warrantyDTO.getEndDate());
        currentWarranty.setStatus(warrantyDTO.getStatus());

        Warranty savedWarranty = warrantyRepository.save(currentWarranty);

        return toDTO(savedWarranty);
    }

    //Xoa phieu bao hanh
    // API = PUT /api/warranties/id
    public void deleteWarranty(Integer warrantyId){
        Warranty currentWarranty = warrantyRepository.findById(warrantyId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu bảo hành ID: " + warrantyId));

        warrantyRepository.delete(currentWarranty);
    }

    //Convert WarrantyDTO
    public WarrantyDTO toDTO(Warranty warranty) {
        WarrantyDTO resDTO = new WarrantyDTO();
        resDTO.setWarrantyId(warranty.getWarrantyId());
        resDTO.setStartDate(warranty.getStartDate());
        resDTO.setEndDate(warranty.getEndDate());
        resDTO.setStatus(warranty.getStatus());

        OrderItem item = warranty.getOrderItem();
        if (item != null) {
            resDTO.setOrderItemId(item.getOrderItemId());
            resDTO.setSerialNo(item.getSerialNo());
                
            Order order = item.getOrder();
                if (order != null) {
                    resDTO.setOrderId(order.getOrderId());
                    resDTO.setCustomerName(order.getReceiverName());
                    resDTO.setCustomerPhone(order.getReceiverPhone());
                }
            
            if (item.getProductVariant() != null && item.getProductVariant().getProduct() != null) {
                resDTO.setProductName(item.getProductVariant().getProduct().getName());
            }
        }
        

        return resDTO;
    }
}