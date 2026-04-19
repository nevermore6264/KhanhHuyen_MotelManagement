package com.motelmanagement.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.ConstraintMode;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Giao dịch thanh toán (gắn hóa đơn, số tiền, phương thức, thời gian). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "thanh_toan")
public class ThanhToan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "hoa_don_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private HoaDon hoaDon;

    @Column(name = "so_tien", precision = 12, scale = 2)
    private BigDecimal soTien;

    @Column(name = "thoi_gian_thanh_toan")
    private LocalDateTime thoiGianThanhToan = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "phuong_thuc", nullable = false, length = 20)
    private PhuongThucThanhToan phuongThuc = PhuongThucThanhToan.CASH;
}
