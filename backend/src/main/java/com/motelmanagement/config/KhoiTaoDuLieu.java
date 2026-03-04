package com.motelmanagement.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.repository.NguoiDungRepository;

/** Khoi tao du lieu khi chay ung dung (VD: tai khoan admin mac dinh). */
@Component
public class KhoiTaoDuLieu implements CommandLineRunner {
    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;

    public KhoiTaoDuLieu(NguoiDungRepository nguoiDungRepository, PasswordEncoder passwordEncoder) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... thamSo) {
        if (nguoiDungRepository.findByTenDangNhap("admin").isEmpty()) {
            NguoiDung nguoiDungAdmin = new NguoiDung();
            nguoiDungAdmin.setTenDangNhap("admin");
            nguoiDungAdmin.setMatKhau(passwordEncoder.encode("admin123"));
            nguoiDungAdmin.setHoTen("System Admin");
            nguoiDungAdmin.setVaiTro(VaiTro.ADMIN);
            nguoiDungAdmin.setKichHoat(true);
            nguoiDungRepository.save(nguoiDungAdmin);
        }
    }
}
