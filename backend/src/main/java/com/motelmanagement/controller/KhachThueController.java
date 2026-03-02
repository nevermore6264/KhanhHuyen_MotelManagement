package com.motelmanagement.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.dto.TenantCreateDto;
import com.motelmanagement.repository.KhoNguoiDung;
import com.motelmanagement.repository.KhoKhachThue;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.FileKhachThueService;

import lombok.RequiredArgsConstructor;

/** API quản lý khách thuê (CRUD, gắn tài khoản). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tenants")
public class KhachThueController {
    private final KhoKhachThue khoKhachThue;
    private final KhoNguoiDung khoNguoiDung;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final FileKhachThueService fileKhachThueService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<KhachThue> layDanhSach(@RequestParam(value = "q", required = false) String tuKhoa) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung != null && nguoiDung.getVaiTro() == VaiTro.TENANT) {
            KhachThue khachThue = khoKhachThue.findByUser_Id(nguoiDung.getId());
            return khachThue != null ? List.of(khachThue) : List.of();
        }
        if (tuKhoa != null && !tuKhoa.isBlank()) {
            return khoKhachThue.findByFullNameContainingIgnoreCase(tuKhoa);
        }
        return khoKhachThue.findAll();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<KhachThue> layThongTinToi() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return ResponseEntity.notFound().build();
        }
        KhachThue khachThue = khoKhachThue.findByUser_Id(nguoiDung.getId());
        return khachThue != null ? ResponseEntity.ok(khachThue) : ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public KhachThue tao(@RequestBody TenantCreateDto dto) {
        KhachThue khachThue = new KhachThue();
        khachThue.setFullName(dto.getFullName());
        khachThue.setPhone(dto.getPhone());
        khachThue.setIdNumber(dto.getIdNumber());
        khachThue.setAddress(dto.getAddress());
        khachThue.setEmail(dto.getEmail());
        if (dto.getUserId() != null) {
            khachThue.setUser(khoNguoiDung.findById(dto.getUserId()).orElse(null));
        }
        return khoKhachThue.save(khachThue);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> taoVoiFile(
            @RequestParam String fullName,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String idNumber,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) MultipartFile portrait,
            @RequestParam(required = false) MultipartFile idCard) {
        try {
            KhachThue khachThue = new KhachThue();
            khachThue.setFullName(fullName != null ? fullName.trim() : "");
            khachThue.setPhone(phone != null && !phone.isBlank() ? phone.trim() : null);
            khachThue.setIdNumber(idNumber != null && !idNumber.isBlank() ? idNumber.trim() : null);
            khachThue.setAddress(address != null && !address.isBlank() ? address.trim() : null);
            khachThue.setEmail(email != null && !email.isBlank() ? email.trim() : null);
            if (userId != null) {
                khachThue.setUser(khoNguoiDung.findById(userId).orElse(null));
            }
            if (portrait != null && !portrait.isEmpty()) {
                khachThue.setPortraitImagePath(fileKhachThueService.luuAnh(portrait));
            }
            if (idCard != null && !idCard.isEmpty()) {
                khachThue.setIdCardImagePath(fileKhachThueService.luuAnh(idCard));
            }
            return ResponseEntity.ok(khoKhachThue.save(khachThue));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lưu ảnh thất bại");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> capNhat(@PathVariable("id") Long ma, @RequestBody KhachThue khachThue) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null || nguoiDung.getVaiTro() != VaiTro.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        return khoKhachThue.findById(ma)
                .map(hienTai -> {
                    hienTai.setFullName(khachThue.getFullName());
                    hienTai.setPhone(khachThue.getPhone());
                    hienTai.setIdNumber(khachThue.getIdNumber());
                    hienTai.setAddress(khachThue.getAddress());
                    hienTai.setEmail(khachThue.getEmail());
                    if (khachThue.getUser() != null && khachThue.getUser().getId() != null) {
                        hienTai.setUser(khoNguoiDung.findById(khachThue.getUser().getId()).orElse(null));
                    }
                    return ResponseEntity.ok(khoKhachThue.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> xoa(@PathVariable("id") Long ma) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null || nguoiDung.getVaiTro() != VaiTro.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        khoKhachThue.deleteById(ma);
        return ResponseEntity.ok().build();
    }
}
