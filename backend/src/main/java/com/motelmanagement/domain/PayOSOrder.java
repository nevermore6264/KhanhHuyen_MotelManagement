package com.motelmanagement.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "payos_order", indexes = @Index(unique = true, columnList = "orderCode"))
public class PayOSOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã đơn hàng gửi lên PayOS (unique) */
    private long orderCode;

    /** Hóa đơn tương ứng */
    private Long invoiceId;

    private LocalDateTime createdAt = LocalDateTime.now();
}
