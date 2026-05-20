package com.motelmanagement.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
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
@Table(name = "tin_nhan")
public class TinNhan {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "hoi_thoai_id")
    private HoiThoai hoiThoai;

    @ManyToOne
    @JoinColumn(name = "nguoi_gui_id", nullable = false)
    private NguoiDung nguoiGui;

    @ManyToOne
    @JoinColumn(name = "nguoi_nhan_id")
    private NguoiDung nguoiNhan;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    private Phong phong;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai", nullable = false, length = 20)
    private LoaiTinNhan loai = LoaiTinNhan.TEXT;

    @Column(name = "noi_dung", length = 2000)
    private String noiDung;

    @Column(name = "duong_dan_file", length = 500)
    private String duongDanFile;

    @Column(name = "ten_file", length = 255)
    private String tenFile;

    @Column(name = "kich_thuoc_file")
    private Long kichThuocFile;

    @Column(name = "loai_noi_dung_file", length = 120)
    private String loaiNoiDungFile;

    @Column(name = "da_doc", nullable = false)
    private boolean daDoc;

    @Column(name = "thoi_gian_gui", nullable = false)
    private LocalDateTime thoiGianGui = LocalDateTime.now();
}
