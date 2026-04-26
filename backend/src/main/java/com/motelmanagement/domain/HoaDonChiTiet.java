package com.motelmanagement.domain;

import java.math.BigDecimal;

import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Một dòng chi tiết trên hóa đơn (giữ xe, wifi, sửa chữa, …). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "hoa_don_chi_tiet")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "hoaDon"})
public class HoaDonChiTiet {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "hoa_don_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_hoa_don_chi_tiet_hoa_don"))
    private HoaDon hoaDon;

    @Column(name = "ten_khoan", nullable = false, length = 200)
    private String tenKhoan;

    @Column(name = "so_tien", precision = 12, scale = 2, nullable = false)
    private BigDecimal soTien;

    @Column(name = "thu_tu", nullable = false)
    private int thuTu;
}
