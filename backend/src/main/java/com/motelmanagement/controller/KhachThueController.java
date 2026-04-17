package com.motelmanagement.controller;

import java.io.UncheckedIOException;
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
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.FileKhachThueService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** API quản lý khách thuê (CRUD, gắn tài khoản). */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/khach-thue")
public class KhachThueController {
    private final KhachThueRepository khachThueRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final FileKhachThueService fileKhachThueService;

    /**
     * Một tài khoản chỉ gắn một dòng khách (unique nguoi_dung_id). Trước khi gán user cho
     * khách này, gỡ user đó khỏi dòng khách khác (nếu có) để tránh lỗi unique constraint.
     */
    private void ganNguoiDungChoKhach(KhachThue khach, NguoiDung nguoiDung) {
        if (nguoiDung != null && nguoiDung.getId() != null) {
            KhachThue daCo = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
            if (daCo != null && !daCo.getId().equals(khach.getId())) {
                daCo.setNguoiDung(null);
                khachThueRepository.save(daCo);
            }
        }
        khach.setNguoiDung(nguoiDung);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<KhachThue> layDanhSach(@RequestParam(value = "q", required = false) String tuKhoa) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung != null && nguoiDung.getVaiTro() == VaiTro.TENANT) {
            KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
            return khachThue != null ? List.of(khachThue) : List.of();
        }
        if (tuKhoa != null && !tuKhoa.isBlank()) {
            return khachThueRepository.findByHoTenContainingIgnoreCase(tuKhoa);
        }
        return khachThueRepository.findAll();
    }

    @GetMapping("/cua-toi")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<KhachThue> layThongTinToi() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return ResponseEntity.notFound().build();
        }
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        return khachThue != null ? ResponseEntity.ok(khachThue) : ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public KhachThue tao(@RequestBody TenantCreateDto dto) {
        KhachThue khachThue = new KhachThue();
        khachThue.setHoTen(dto.getFullName());
        khachThue.setSoDienThoai(dto.getPhone());
        khachThue.setSoGiayTo(dto.getIdNumber());
        khachThue.setDiaChi(dto.getAddress());
        khachThue.setEmail(dto.getEmail());
        if (dto.getUserId() != null) {
            ganNguoiDungChoKhach(
                    khachThue,
                    nguoiDungRepository.findById(dto.getUserId()).orElse(null));
        }
        return khachThueRepository.save(khachThue);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> taoVoiFile(
            @RequestParam("fullName") String fullName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "idNumber", required = false) String idNumber,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "portrait", required = false) MultipartFile portrait,
            @RequestParam(value = "idCard", required = false) MultipartFile idCard) {
        try {
            KhachThue khachThue = new KhachThue();
            khachThue.setHoTen(fullName != null ? fullName.trim() : "");
            khachThue.setSoDienThoai(phone != null && !phone.isBlank() ? phone.trim() : null);
            khachThue.setSoGiayTo(idNumber != null && !idNumber.isBlank() ? idNumber.trim() : null);
            khachThue.setDiaChi(address != null && !address.isBlank() ? address.trim() : null);
            khachThue.setEmail(email != null && !email.isBlank() ? email.trim() : null);
            if (userId != null) {
                ganNguoiDungChoKhach(
                        khachThue,
                        nguoiDungRepository.findById(userId).orElse(null));
            }
            if (portrait != null && !portrait.isEmpty()) {
                khachThue.setAnhChanDung(fileKhachThueService.luuAnh(portrait));
            }
            if (idCard != null && !idCard.isEmpty()) {
                khachThue.setAnhGiayTo(fileKhachThueService.luuAnh(idCard));
            }
            return ResponseEntity.ok(khachThueRepository.save(khachThue));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UncheckedIOException e) {
            log.error("taoVoiFile: ghi file anh that bai", e);
            return ResponseEntity.internalServerError().body("Không ghi được file ảnh");
        } catch (Exception e) {
            log.error("taoVoiFile: luu khach thue hoac file that bai", e);
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
        return khachThueRepository.findById(ma)
                .map(hienTai -> {
                    hienTai.setHoTen(khachThue.getHoTen());
                    hienTai.setSoDienThoai(khachThue.getSoDienThoai());
                    hienTai.setSoGiayTo(khachThue.getSoGiayTo());
                    hienTai.setDiaChi(khachThue.getDiaChi());
                    hienTai.setEmail(khachThue.getEmail());
                    if (khachThue.getNguoiDung() != null && khachThue.getNguoiDung().getId() != null) {
                        ganNguoiDungChoKhach(
                                hienTai,
                                nguoiDungRepository
                                        .findById(khachThue.getNguoiDung().getId())
                                        .orElse(null));
                    }
                    return ResponseEntity.ok(khachThueRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> capNhatVoiFile(
            @PathVariable("id") Long ma,
            @RequestParam("fullName") String fullName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "idNumber", required = false) String idNumber,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "userId", required = false) String userIdStr,
            @RequestParam(value = "portrait", required = false) MultipartFile portrait,
            @RequestParam(value = "idCard", required = false) MultipartFile idCard) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null || nguoiDung.getVaiTro() != VaiTro.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        try {
            return khachThueRepository.findById(ma)
                    .map(hienTai -> {
                        hienTai.setHoTen(fullName != null ? fullName.trim() : "");
                        hienTai.setSoDienThoai(phone != null && !phone.isBlank() ? phone.trim() : null);
                        hienTai.setSoGiayTo(idNumber != null && !idNumber.isBlank() ? idNumber.trim() : null);
                        hienTai.setDiaChi(address != null && !address.isBlank() ? address.trim() : null);
                        hienTai.setEmail(email != null && !email.isBlank() ? email.trim() : null);
                        if (userIdStr != null) {
                            if (userIdStr.isBlank()) {
                                hienTai.setNguoiDung(null);
                            } else {
                                try {
                                    Long uid = Long.parseLong(userIdStr.trim());
                                    ganNguoiDungChoKhach(
                                            hienTai,
                                            nguoiDungRepository.findById(uid).orElse(null));
                                } catch (NumberFormatException ignored) {
                                    hienTai.setNguoiDung(null);
                                }
                            }
                        }
                        if (portrait != null && !portrait.isEmpty()) {
                            hienTai.setAnhChanDung(fileKhachThueService.luuAnh(portrait));
                        }
                        if (idCard != null && !idCard.isEmpty()) {
                            hienTai.setAnhGiayTo(fileKhachThueService.luuAnh(idCard));
                        }
                        return ResponseEntity.ok(khachThueRepository.save(hienTai));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (UncheckedIOException e) {
            log.error("capNhatVoiFile: ghi file anh that bai", e);
            return ResponseEntity.internalServerError().body("Không ghi được file ảnh");
        } catch (Exception e) {
            log.error("capNhatVoiFile: cap nhat khach thue hoac file that bai", e);
            return ResponseEntity.internalServerError().body("Lưu ảnh thất bại");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> xoa(@PathVariable("id") Long ma) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null || nguoiDung.getVaiTro() != VaiTro.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        khachThueRepository.deleteById(ma);
        return ResponseEntity.ok().build();
    }
}
