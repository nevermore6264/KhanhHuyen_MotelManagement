package com.motelmanagement.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    private int month;
    private int year;

    @Column(precision = 12, scale = 2)
    private BigDecimal roomCost;

    @Column(precision = 12, scale = 2)
    private BigDecimal electricityCost;

    @Column(precision = 12, scale = 2)
    private BigDecimal waterCost;

    @Column(precision = 12, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    private LocalDateTime createdAt = LocalDateTime.now();

    /** Thời điểm gửi nhắc nợ qua email gần nhất (null = chưa gửi). */
    private LocalDateTime lastReminderEmailAt;

    /** Thời điểm gửi nhắc nợ qua SMS gần nhất (null = chưa gửi). */
    private LocalDateTime lastReminderSmsAt;
}
