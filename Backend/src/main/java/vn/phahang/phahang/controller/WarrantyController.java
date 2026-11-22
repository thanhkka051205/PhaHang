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
import org.springframework.web.bind.annotation.RequestParam;
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

    // GET /api/warranties
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<WarrantyDTO>> getAllWarranties() {
        return ResponseEntity.ok(this.warrantyService.getAllWarranties());
    }

    // GET /api/warranties/lookup?phone=0901000003&serialNo=SN-IPHONE16PRO-8899
    @GetMapping("/lookup")
    public ResponseEntity<List<WarrantyDTO>> lookupWarranties(
            @RequestParam(value = "phone", required = false) String customerPhone,
            @RequestParam(value = "serialNo", required = false) String serialNo) {
        return ResponseEntity.ok(this.warrantyService.lookupWarranties(customerPhone, serialNo));
    }

    // POST /api/warranties
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<WarrantyDTO> createWarranty(@Valid @RequestBody WarrantyDTO warrantyDTO) {
        WarrantyDTO created = this.warrantyService.createWarranty(warrantyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/warranties/{warrantyId}
    @PutMapping("/{warrantyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<WarrantyDTO> updateWarranty(
            @PathVariable("warrantyId") Integer warrantyId,
            @Valid @RequestBody WarrantyDTO warrantyDTO) {
        return ResponseEntity.ok(this.warrantyService.updateWarranty(warrantyId, warrantyDTO));
    }

    // DELETE /api/warranties/{warrantyId}
    @DeleteMapping("/{warrantyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteWarranty(@PathVariable("warrantyId") Integer warrantyId) {
        this.warrantyService.deleteWarranty(warrantyId);
        return ResponseEntity.noContent().build();
    }
}
