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
        name = "phan_hoi_tin_nhan",
        uniqueConstraints = @UniqueConstraint(columnNames = { "tin_nhan_id", "nguoi_dung_id", "emoji" }))
public class PhanHoiTinNhan {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tin_nhan_id", nullable = false)
    private TinNhan tinNhan;

    @ManyToOne(optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "emoji", nullable = false, length = 32)
    private String emoji;

    @Column(name = "thoi_gian", nullable = false)
    private LocalDateTime thoiGian = LocalDateTime.now();
}
