package vn.phahang.phahang.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_serials")
@Data
public class ProductSerial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "serial_id")
    private Integer serialId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant productVariant;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", unique = true)
    private OrderItem orderItem;

    @Column(name = "serial_no", nullable = false, unique = true, length = 100)
    private String serialNo;

    @Column(name = "status", length = 30)
    private String status = "SOLD";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}