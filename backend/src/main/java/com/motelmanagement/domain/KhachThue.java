package com.motelmanagement.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Khách thuê: thông tin cá nhân, có thể gắn một tài khoản NguoiDung (TENANT). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "khach_thue")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class KhachThue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "so_giay_to", length = 50)
    private String soGiayTo;

    @Column(name = "dia_chi", length = 200)
    private String diaChi;

    @Column(name = "email", length = 100)
    private String email;

    /** Đường dẫn ảnh chân dung (lưu trong resources/static/tenant-files/tenants). */
    @Column(name = "anh_chan_dung", length = 255)
    private String anhChanDung;

    /** Đường dẫn ảnh CCCD/CMND (lưu trong resources/static/tenant-files/tenants). */
    @Column(name = "anh_giay_to", length = 255)
    private String anhGiayTo;

    @OneToOne
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;
}
