package vn.phahang.phahang.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.phahang.phahang.backend1.domain.OrderItem;
import vn.phahang.phahang.domain.Warranty;
import vn.phahang.phahang.dto.WarrantyDTO;
import vn.phahang.phahang.repository.OrderItemRepository;
import vn.phahang.phahang.repository.WarrantyRepository;

@Service
public class WarrantyService {
    private final WarrantyRepository warrantyRepository;
    private final OrderItemRepository orderItemRepository;
    public WarrantyService(WarrantyRepository warrantyRepository, OrderItemRepository orderItemRepository){
        this.warrantyRepository = warrantyRepository;
        this.orderItemRepository = orderItemRepository;
    }

    //Tao moi
    public WarrantyDTO createWarranty(WarrantyDTO warrantyDTO){
        OrderItem orderItem = orderItemRepository.findById(warrantyDTO.getOrderItemId())
            .orElseThrow(()-> new RuntimeException("KHông tìm thấy OrderItem"));

        Warranty warranty = new Warranty();
        warranty.setOrderItem(orderItem);
        warranty.setStartDate(warrantyDTO.getStartDate());
        warranty.setEndDate(warrantyDTO.getEndDate());
        warranty.setStatus(warrantyDTO.getStatus());

        Warranty savedWarranty = this.warrantyRepository.save(warranty);

        WarrantyDTO resDTO = new WarrantyDTO();
        resDTO.setWarrantyId(savedWarranty.getWarrantyId());
        resDTO.setOrderItemId(orderItem.getOrderItemId());
        resDTO.setStartDate(savedWarranty.getStartDate());
        resDTO.setEndDate(savedWarranty.getEndDate());
        resDTO.setStatus(savedWarranty.getStatus());

        return resDTO;
    }

    // Tra cứu bảo hành theo ID
    public Optional<Warranty> getWarrantyById(Integer warrantyId){
        return warrantyRepository.findById(warrantyId);
    }

}
