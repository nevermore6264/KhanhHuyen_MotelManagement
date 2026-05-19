package com.motelmanagement.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "hoa_don")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HoaDon {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    private Phong phong;

    @ManyToOne
    @JoinColumn(name = "khach_thue_id")
    private KhachThue khachThue;

    @Column(name = "thang")
    private int thang;

    @Column(name = "nam")
    private int nam;


    @Transient
    private BigDecimal tienPhong;


    @Transient
    private BigDecimal tienDien;


    @Transient
    private BigDecimal tienNuoc;


    @Transient
    private BigDecimal tongTien;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private TrangThaiHoaDon trangThai = TrangThaiHoaDon.UNPAID;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();
}
