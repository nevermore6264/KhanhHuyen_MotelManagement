package com.motelmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Ứng dụng Spring Boot: quản lý nhà trọ (khu vực, phòng, hợp đồng, hóa đơn, thanh toán). */
@SpringBootApplication
@EnableScheduling
public class ChuongTrinh {
    public static void main(String[] args) {
        SpringApplication.run(ChuongTrinh.class, args);
    }
}
