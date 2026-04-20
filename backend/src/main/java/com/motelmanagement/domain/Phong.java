package com.motelmanagement.domain;

import java.math.BigDecimal;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "phong")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Phong {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @Column(name = "ma_phong", nullable = false, length = 30)
    private String maPhong;

    @Column(name = "tang", length = 30)
    private String tang;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private TrangThaiPhong trangThai = TrangThaiPhong.AVAILABLE;

    @ManyToOne
    @JoinColumn(name = "khu_vuc_id")
    private KhuVuc khuVuc;

    @Column(name = "gia_hien_tai", precision = 12, scale = 2)
    private BigDecimal giaHienTai;

    @Column(name = "dien_tich", precision = 8, scale = 2)
    private BigDecimal dienTich;
}
