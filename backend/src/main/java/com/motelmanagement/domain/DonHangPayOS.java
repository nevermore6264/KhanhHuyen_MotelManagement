package com.motelmanagement.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    /** Mã đơn hàng gửi lên PayOS (unique) */
    @jakarta.persistence.Column(name = "ma_don_hang")
    private long maDonHang;

    /** Hóa đơn tương ứng */
    @jakarta.persistence.Column(name = "hoa_don_id", length = 36)
    private String maHoaDon;

    @jakarta.persistence.Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();
}
