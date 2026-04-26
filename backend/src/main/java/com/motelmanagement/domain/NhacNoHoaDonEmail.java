package com.motelmanagement.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Lịch sử gửi email nhắc nợ theo hóa đơn (tách khỏi bảng {@code hoa_don}).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "nhac_no_hoa_don_email")
public class NhacNoHoaDonEmail {

    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "hoa_don_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_nhac_no_email_hoa_don"))
    private HoaDon hoaDon;

    @Column(name = "gui_luc", nullable = false)
    private LocalDateTime guiLuc = LocalDateTime.now();

    @Column(name = "email_nguoi_nhan", length = 255)
    private String emailNguoiNhan;

    /** Nội dung plain text đã gửi (khớp phần text trong email). */
    @Column(name = "noi_dung", length = 2000)
    private String noiDung;
}
