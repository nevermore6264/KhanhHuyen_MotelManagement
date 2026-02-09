package com.motelmanagement.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class ServicePrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(precision = 12, scale = 2)
    private BigDecimal roomPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal electricityPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal waterPrice;

    private LocalDate effectiveFrom;
}
