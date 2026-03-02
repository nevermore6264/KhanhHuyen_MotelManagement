package com.motelmanagement.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Chỉ số điện/nước theo phòng và tháng (dùng tính tiền hóa đơn). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "chi_so_dien_nuoc")
public class ChiSoDienNuoc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    private Phong phong;

    @Column(name = "thang")
    private int thang;

    @Column(name = "nam")
    private int nam;

    @Column(name = "dien_cu")
    private int dienCu;

    @Column(name = "dien_moi")
    private int dienMoi;

    @Column(name = "nuoc_cu")
    private int nuocCu;

    @Column(name = "nuoc_moi")
    private int nuocMoi;

    @Column(name = "tien_dien", precision = 12, scale = 2)
    private BigDecimal tienDien;

    @Column(name = "tien_nuoc", precision = 12, scale = 2)
    private BigDecimal tienNuoc;

    @Column(name = "tong_tien", precision = 12, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();
}
