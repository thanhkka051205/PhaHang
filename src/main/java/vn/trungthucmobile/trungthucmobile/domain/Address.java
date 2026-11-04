package vn.trungthucmobile.trungthucmobile.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ADDRESSES")
@Data
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    private Long addressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "receiver_name", nullable = false, length = 100)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @Column(name = "address_detail", nullable = false, columnDefinition = "TEXT")
    private String addressDetail;

    @Column(name = "is_default")
    private Boolean isDefault = false;
}