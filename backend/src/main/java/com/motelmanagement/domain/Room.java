package com.motelmanagement.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(length = 30)
    private String floor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @ManyToOne
    @JoinColumn(name = "area_id")
    private Area area;

    @Column(precision = 12, scale = 2)
    private BigDecimal currentPrice;

    @Column(precision = 8, scale = 2)
    private BigDecimal areaSize;
}
