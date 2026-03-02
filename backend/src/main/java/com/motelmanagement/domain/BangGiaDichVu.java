package com.motelmanagement.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Đơn giá dịch vụ (điện/nước) áp dụng từ một thời điểm. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "bang_gia_dich_vu")
public class BangGiaDichVu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gia_phong", precision = 12, scale = 2)
    private BigDecimal giaPhong;

    @Column(name = "gia_dien", precision = 12, scale = 2)
    private BigDecimal giaDien;

    @Column(name = "gia_nuoc", precision = 12, scale = 2)
    private BigDecimal giaNuoc;

    @Column(name = "hieu_luc_tu")
    private LocalDate hieuLucTu;
}
