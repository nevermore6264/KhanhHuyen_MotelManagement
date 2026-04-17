package com.motelmanagement.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Hóa đơn theo tháng cho một phòng / khách thuê (tiền phòng, điện, nước). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "hoa_don")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HoaDon {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne
    @JoinColumn(name = "phong_id")
    private Phong phong;

    @ManyToOne
    @JoinColumn(name = "khach_thue_id")
    private KhachThue khachThue;

    @Column(name = "thang")
    private int thang;

    @Column(name = "nam")
    private int nam;

    /** Tính động khi trả API, không lưu DB. */
    @Transient
    private BigDecimal tienPhong;

    /** Tính động khi trả API, không lưu DB. */
    @Transient
    private BigDecimal tienDien;

    /** Tính động khi trả API, không lưu DB. */
    @Transient
    private BigDecimal tienNuoc;

    /** Tính động khi trả API, không lưu DB. */
    @Transient
    private BigDecimal tongTien;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 20)
    private TrangThaiHoaDon trangThai = TrangThaiHoaDon.UNPAID;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();

    /** Thời điểm gửi nhắc nợ qua email gần nhất (null = chưa gửi). */
    @Column(name = "nhac_no_email_lan_cuoi")
    private LocalDateTime nhacNoEmailLanCuoi;

    /** Số lần đã gửi nhắc nợ qua email. */
    @Column(name = "so_lan_nhac_no_email")
    private int soLanNhacNoEmail;

    /** Nội dung email nhắc nợ gần nhất (để hiển thị lại). */
    @Column(name = "noi_dung_email_cuoi", length = 2000)
    private String noiDungEmailCuoi;

    /** Thời điểm gửi nhắc nợ qua SMS gần nhất (null = chưa gửi). */
    @Column(name = "nhac_no_sms_lan_cuoi")
    private LocalDateTime nhacNoSmsLanCuoi;

    /** Số lần đã gửi nhắc nợ qua SMS. */
    @Column(name = "so_lan_nhac_no_sms")
    private int soLanNhacNoSms;

    /** Nội dung SMS nhắc nợ gần nhất (để hiển thị lại). */
    @Column(name = "noi_dung_sms_cuoi", length = 500)
    private String noiDungSmsCuoi;
}
