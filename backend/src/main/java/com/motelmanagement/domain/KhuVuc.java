package com.motelmanagement.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Khu vực / tòa nhà chứa các phòng. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "khu_vuc")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class KhuVuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten", nullable = false, length = 100)
    private String ten;

    @Column(name = "dia_chi", length = 200)
    private String diaChi;

    @Column(name = "mo_ta", length = 500)
    private String moTa;
}
