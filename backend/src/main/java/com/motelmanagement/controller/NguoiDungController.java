package com.motelmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.dto.DtoLienKetNguoiDungKhachThue;
import com.motelmanagement.dto.YeuCauTaoNguoiDung;
import com.motelmanagement.repository.KhoKhachThue;
import com.motelmanagement.repository.KhoNguoiDung;

import lombok.RequiredArgsConstructor;

/** API quản lý người dùng (chỉ ADMIN): CRUD, khóa/mở, gắn khách thuê. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class NguoiDungController {
    private final KhoNguoiDung khoNguoiDung;
    private final KhoKhachThue khoKhachThue;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<NguoiDung> layDanhSach() {
        return khoNguoiDung.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public NguoiDung tao(@RequestBody YeuCauTaoNguoiDung dto) {
        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setTenDangNhap(dto.getTenDangNhap());
        nguoiDung.setMatKhau(passwordEncoder.encode(dto.getMatKhau()));
        nguoiDung.setHoTen(dto.getHoTen() != null ? dto.getHoTen() : "");
        nguoiDung.setSoDienThoai(dto.getSoDienThoai());
        nguoiDung.setVaiTro(dto.getVaiTro() != null ? dto.getVaiTro() : VaiTro.STAFF);
        nguoiDung.setKichHoat(dto.isKichHoat());
        NguoiDung daLuu = khoNguoiDung.save(nguoiDung);
        if (dto.getMaKhachThue() != null && daLuu.getVaiTro() == VaiTro.TENANT) {
            khoKhachThue.findById(dto.getMaKhachThue()).ifPresent(khachThue -> {
                khachThue.setUser(daLuu);
                khoKhachThue.save(khachThue);
            });
        }
        return daLuu;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NguoiDung> capNhat(@PathVariable("id") Long ma, @RequestBody NguoiDung nguoiDung) {
        return khoNguoiDung.findById(ma)
                .map(hienTai -> {
                    hienTai.setHoTen(nguoiDung.getHoTen());
                    hienTai.setSoDienThoai(nguoiDung.getSoDienThoai());
                    hienTai.setVaiTro(nguoiDung.getVaiTro());
                    hienTai.setKichHoat(nguoiDung.isKichHoat());
                    if (nguoiDung.getMatKhau() != null && !nguoiDung.getMatKhau().isBlank()) {
                        hienTai.setMatKhau(passwordEncoder.encode(nguoiDung.getMatKhau()));
                    }
                    return ResponseEntity.ok(khoNguoiDung.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NguoiDung> khoa(@PathVariable("id") Long ma) {
        return khoNguoiDung.findById(ma)
                .map(hienTai -> {
                    hienTai.setKichHoat(false);
                    return ResponseEntity.ok(khoNguoiDung.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NguoiDung> moKhoa(@PathVariable("id") Long ma) {
        return khoNguoiDung.findById(ma)
                .map(hienTai -> {
                    hienTai.setKichHoat(true);
                    return ResponseEntity.ok(khoNguoiDung.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Chỉ gắn hoặc bỏ gắn tài khoản với khách thuê. tenantId = null để bỏ gắn. */
    @PutMapping("/{id}/tenant")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> lienKetKhachThue(@PathVariable("id") Long maNguoiDung, @RequestBody DtoLienKetNguoiDungKhachThue dto) {
        NguoiDung nguoiDung = khoNguoiDung.findById(maNguoiDung).orElse(null);
        if (nguoiDung == null) {
            return ResponseEntity.notFound().build();
        }
        KhachThue hienTai = khoKhachThue.findByUser_Id(maNguoiDung);
        if (hienTai != null) {
            hienTai.setUser(null);
            khoKhachThue.save(hienTai);
        }
        if (dto.getTenantId() != null) {
            khoKhachThue.findById(dto.getTenantId()).ifPresent(khachThue -> {
                khachThue.setUser(nguoiDung);
                khoKhachThue.save(khachThue);
            });
        }
        return ResponseEntity.ok().build();
    }
}
