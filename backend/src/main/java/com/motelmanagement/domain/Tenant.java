package com.motelmanagement.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Tenant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(length = 50)
    private String idNumber;

    @Column(length = 200)
    private String address;

    @Column(length = 100)
    private String email;

    /** Đường dẫn file ảnh chân dung (lưu trong uploads/tenants/). */
    @Column(length = 255)
    private String portraitImagePath;

    /** Đường dẫn file ảnh CCCD/CMND (lưu trong uploads/tenants/). */
    @Column(length = 255)
    private String idCardImagePath;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
