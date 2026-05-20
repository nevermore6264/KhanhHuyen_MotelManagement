package com.motelmanagement.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "thanh_vien_hoi_thoai",
        uniqueConstraints = @UniqueConstraint(columnNames = { "hoi_thoai_id", "nguoi_dung_id" }))
public class ThanhVienHoiThoai {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "hoi_thoai_id", nullable = false)
    private HoiThoai hoiThoai;

    @ManyToOne(optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "thoi_gian_tham_gia", nullable = false)
    private LocalDateTime thoiGianThamGia = LocalDateTime.now();
}
