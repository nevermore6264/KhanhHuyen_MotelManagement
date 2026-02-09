package com.motelmanagement.domain;

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
public class MeterReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private int month;
    private int year;

    private int oldElectric;
    private int newElectric;
    private int oldWater;
    private int newWater;

    @Column(precision = 12, scale = 2)
    private BigDecimal electricityCost;

    @Column(precision = 12, scale = 2)
    private BigDecimal waterCost;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalCost;

    private LocalDateTime createdAt = LocalDateTime.now();
}
