package com.motelmanagement.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
/** Đơn PayOS: mã đơn, trạng thái, số tiền, liên kết hóa đơn/thanh toán. */
@Entity
@Table(name = "don_hang_payos", indexes = @Index(unique = true, columnList = "ma_don_hang"))
public class DonHangPayOS {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã đơn hàng gửi lên PayOS (unique) */
    @jakarta.persistence.Column(name = "ma_don_hang")
    private long maDonHang;

    /** Hóa đơn tương ứng */
    @jakarta.persistence.Column(name = "hoa_don_id")
    private Long maHoaDon;

    @jakarta.persistence.Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();
}
