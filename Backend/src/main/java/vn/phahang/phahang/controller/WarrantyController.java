package vn.phahang.phahang.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.phahang.phahang.dto.WarrantyDTO;
import vn.phahang.phahang.service.WarrantyService;

@RestController
@RequestMapping("/api/warranties")
@CrossOrigin(origins = "*")
public class WarrantyController {

    private final WarrantyService warrantyService;

    public WarrantyController(WarrantyService warrantyService) {
        this.warrantyService = warrantyService;
    }

    // API lấy danh sách
    // /api/warranties
    @GetMapping
    public ResponseEntity<List<WarrantyDTO>> getAllWarranties() {
        return ResponseEntity.ok(warrantyService.getAllWarranties());
    }

    // API tạo mới
    // /api/warranties
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<WarrantyDTO> createWarranty(@Valid @RequestBody WarrantyDTO warrantyDTO) {
        WarrantyDTO createdWarranty = warrantyService.createWarranty(warrantyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWarranty);
    }

    // API tìm kiếm theo ID
    // /api/warranties/{warrantyId}
    @GetMapping("/{warrantyId}")
    public ResponseEntity<WarrantyDTO> getWarrantyById(@PathVariable Integer warrantyId) {
        WarrantyDTO currentWarranty = warrantyService.getWarrantyById(warrantyId);
        return ResponseEntity.ok(currentWarranty);
    }

    // API cập nhật
    // api/warranties/{warrantyId}
    @PutMapping("/{warrantyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<WarrantyDTO> updateWarranty(@PathVariable("warrantyId") Integer warrantyId, @Valid @RequestBody WarrantyDTO warrantyDTO){
        WarrantyDTO updateWarranty = warrantyService.updateWarranty(warrantyId,warrantyDTO);
        return ResponseEntity.ok(updateWarranty);
    }

    // API xoa
    // api/warranties/{warrantyId}
    @DeleteMapping("/{warrantyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteWarranty(@PathVariable("warrantyId") Integer warrantyId){
        warrantyService.deleteWarranty(warrantyId);
        return ResponseEntity.noContent().build();
    }
}