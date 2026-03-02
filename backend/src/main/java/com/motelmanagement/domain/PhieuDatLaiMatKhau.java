package com.motelmanagement.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Phiếu đặt lại mật khẩu: token một lần, gắn với người dùng và thời hạn hết hạn.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "phieu_dat_lai_mat_khau", indexes = @Index(columnList = "ma_token"))
public class PhieuDatLaiMatKhau {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Token duy nhất gửi qua link/email */
    @Column(name = "ma_token", nullable = false, unique = true, length = 64)
    private String maToken;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    /** Thời điểm hết hạn */
    @Column(name = "het_han_luc", nullable = false)
    private LocalDateTime hetHanLuc;

    /** Kiểm tra phiếu đã quá hạn chưa */
    public boolean daHetHan() {
        return LocalDateTime.now().isAfter(hetHanLuc);
    }
}
