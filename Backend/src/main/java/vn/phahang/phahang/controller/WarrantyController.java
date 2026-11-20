package vn.phahang.phahang.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.phahang.phahang.domain.Warranty;
import vn.phahang.phahang.dto.WarrantyDTO;
import vn.phahang.phahang.service.WarrantyService;
import vn.phahang.phahang.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/warrantis")
@CrossOrigin(origins="*")
public class WarrantyController {
    private final WarrantyService warrantyService;

    public WarrantyController(WarrantyService warrantyService){
        this.warrantyService=warrantyService;
    }

    //API tao moi
    @PostMapping()
    public ResponseEntity<WarrantyDTO> createWarranty(@Valid @RequestBody WarrantyDTO warrantyDTO){
        WarrantyDTO createWarranty=warrantyService.createWarranty(warrantyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createWarranty);
    }

    //API Tim kiem theo ID
    @GetMapping("/{warrantyId}")
    public ResponseEntity<Warranty> getWarrantyById(@PathVariable Integer warrantyId) throws IdInvalidException{
        Warranty currentWarranty = warrantyService.getWarrantyById(warrantyId)
            .orElseThrow(()-> new IdInvalidException("Warranty ID " + warrantyId + " không tồn tại trong hệ thống."));
        return ResponseEntity.ok(currentWarranty);
    } 
}
