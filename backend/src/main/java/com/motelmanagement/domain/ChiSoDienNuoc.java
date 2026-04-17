package com.motelmanagement.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
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
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    private Phong phong;

    @Column(name = "thang")
    private int thang;

    @Column(name = "nam")
    private int nam;

    /** Chỉ số đầu kỳ (số mới tháng trước) — không cột DB, gán trước khi trả JSON. */
    @Transient
    private int dienCu;

    @Column(name = "dien_moi")
    private int dienMoi;

    @Transient
    private int nuocCu;

    @Column(name = "nuoc_moi")
    private int nuocMoi;

    @Column(name = "tien_dien", precision = 12, scale = 2)
    private BigDecimal tienDien;

    @Column(name = "tien_nuoc", precision = 12, scale = 2)
    private BigDecimal tienNuoc;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();
}
