package com.motelmanagement.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/** Yêu cầu hỗ trợ từ khách thuê (nội dung, trạng thái, người tạo). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "yeu_cau_ho_tro")
public class YeuCauHoTro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "khach_thue_id")
    private KhachThue khachThue;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    private Phong phong;

    @Column(name = "tieu_de", nullable = false, length = 150)
    private String tieuDe;

    @Column(name = "mo_ta", length = 2000)
    private String moTa;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private TrangThaiYeuCauHoTro trangThai = TrangThaiYeuCauHoTro.OPEN;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat = LocalDateTime.now();
}
