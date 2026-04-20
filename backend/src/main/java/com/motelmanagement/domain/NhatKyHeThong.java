package com.motelmanagement.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Nhật ký hành động hệ thống (ai làm gì, với entity nào). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "nhat_ky_he_thong")
public class NhatKyHeThong {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "nguoi_thuc_hien_id")
    private NguoiDung nguoiThucHien;

    @Column(name = "hanh_dong", nullable = false, length = 100)
    private String hanhDong;

    @Column(name = "loai_thuc_the", nullable = false, length = 100)
    private String loaiThucThe;

    @Column(name = "ma_thuc_the", length = 50)
    private String maThucThe;

    @Column(name = "chi_tiet", length = 1000)
    private String chiTiet;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();
}
