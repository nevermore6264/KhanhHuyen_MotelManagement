package com.motelmanagement.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    @UuidGenerator
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    private String id;

    @Column(name = "ten", nullable = false, length = 100)
    private String ten;

    @Column(name = "dia_chi", length = 200)
    private String diaChi;

    @Column(name = "mo_ta", length = 500)
    private String moTa;
}
