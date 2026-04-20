package com.motelmanagement.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

/** Một khách thuê thuộc hợp đồng (có thể nhiều người / một phòng). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "hop_dong_thanh_vien",
        uniqueConstraints = @UniqueConstraint(columnNames = {"hop_dong_id", "khach_thue_id"})
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HopDongThanhVien {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "hop_dong_id")
    @JsonBackReference
    private HopDong hopDong;

    @ManyToOne(optional = false)
    @JoinColumn(name = "khach_thue_id")
    private KhachThue khachThue;

    /** Người đại diện / chịu trách nhiệm chính (trùng với hop_dong.khach_thue_id). */
    @Column(name = "la_dai_dien", nullable = false)
    private boolean laDaiDien = false;
}
