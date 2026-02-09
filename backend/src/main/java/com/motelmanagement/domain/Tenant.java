package com.motelmanagement.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
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

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
