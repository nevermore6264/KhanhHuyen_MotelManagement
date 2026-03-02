package com.motelmanagement.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.repository.KhoNguoiDung;

/** Khoi tao du lieu khi chay ung dung (VD: tai khoan admin mac dinh). */
@Component
public class KhoiTaoDuLieu implements CommandLineRunner {
    private final KhoNguoiDung khoNguoiDung;
    private final PasswordEncoder passwordEncoder;

    public KhoiTaoDuLieu(KhoNguoiDung khoNguoiDung, PasswordEncoder passwordEncoder) {
        this.khoNguoiDung = khoNguoiDung;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... thamSo) {
        if (khoNguoiDung.findByTenDangNhap("admin").isEmpty()) {
            NguoiDung nguoiDungAdmin = new NguoiDung();
            nguoiDungAdmin.setTenDangNhap("admin");
            nguoiDungAdmin.setMatKhau(passwordEncoder.encode("admin123"));
            nguoiDungAdmin.setHoTen("System Admin");
            nguoiDungAdmin.setVaiTro(VaiTro.ADMIN);
            nguoiDungAdmin.setKichHoat(true);
            khoNguoiDung.save(nguoiDungAdmin);
        }
    }
}
