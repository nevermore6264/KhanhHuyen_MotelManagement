package com.motelmanagement.controller;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.ThongBao;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.dto.NotificationCreateDto;
import com.motelmanagement.repository.ThongBaoRepository;
import com.motelmanagement.dto.MauThongBaoDto;
import com.motelmanagement.service.MauThongBaoService;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.ThongBaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/thong-bao")
public class ThongBaoController {
    private final ThongBaoRepository thongBaoRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final ThongBaoService thongBaoService;
    private final MauThongBaoService mauThongBaoService;

    @GetMapping("/mau")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MauThongBaoDto> layMau() {
        return mauThongBaoService.layDanhSach();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public List<ThongBao> layDanhSach() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return List.of();
        }

        if (nguoiDung.getVaiTro() == VaiTro.ADMIN) {
            return thongBaoRepository.findAllByOrderByThoiGianGuiDesc();
        }
        return thongBaoRepository.findByNguoiDungOrderByThoiGianGuiDesc(nguoiDung);
    }

    @PutMapping("/{id}/da-doc")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public ResponseEntity<ThongBao> danhDauDaDoc(@PathVariable("id") String ma) {
        return thongBaoRepository.findById(ma)
                .map(hienTai -> {
                    hienTai.setDaDoc(true);
                    return ResponseEntity.ok(thongBaoRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> tao(@RequestBody NotificationCreateDto dto) {
        if (dto.getMessage() == null || dto.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body("Nội dung thông báo không được để trống.");
        }
        thongBaoService.taoVaDay(dto.getMessage(), dto.getUserId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> xoa(@PathVariable("id") String ma) {
        if (!thongBaoRepository.existsById(ma)) {
            return ResponseEntity.notFound().build();
        }
        thongBaoRepository.deleteById(ma);
        return ResponseEntity.noContent().build();
    }
}
