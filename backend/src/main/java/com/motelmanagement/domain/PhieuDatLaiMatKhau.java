package com.motelmanagement.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "phieu_dat_lai_mat_khau", indexes = @Index(columnList = "ma_token"))
public class PhieuDatLaiMatKhau {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;


    @Column(name = "ma_token", nullable = false, unique = true, length = 64)
    private String maToken;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;


    @Column(name = "het_han_luc", nullable = false)
    private LocalDateTime hetHanLuc;


    public boolean daHetHan() {
        return LocalDateTime.now().isAfter(hetHanLuc);
    }
}
