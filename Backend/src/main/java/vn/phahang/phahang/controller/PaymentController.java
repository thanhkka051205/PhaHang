package vn.phahang.phahang.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.phahang.phahang.dto.PaymentDTO;
import vn.phahang.phahang.service.PaymentService;
import vn.phahang.phahang.util.error.IdInvalidException;

@RestController
@RequestMapping("/order/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    //Contructor
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService){
        this.paymentService = paymentService;
    }

    //Tao moi payment
    @PostMapping()
    public ResponseEntity<PaymentDTO> createPayment(@Valid  @RequestBody PaymentDTO postPayment) throws IdInvalidException{
        PaymentDTO createdPayment=paymentService.createPayment(postPayment);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
    }

    //Xoa
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(@PathVariable Integer paymentId) throws IdInvalidException {     
        this.paymentService.handleDeletePayment(paymentId);
        return ResponseEntity.noContent().build();
    }
}
