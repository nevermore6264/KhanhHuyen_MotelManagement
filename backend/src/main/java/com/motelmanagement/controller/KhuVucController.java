package com.motelmanagement.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.KhuVuc;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.dto.AreaWithRoomCountDto;
import com.motelmanagement.repository.KhuVucRepository;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.PhongRepository;

import lombok.RequiredArgsConstructor;

/** API khu vực (kèm số phòng). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/khu-vuc")
public class KhuVucController {
    private final KhuVucRepository khuVucRepository;
    private final PhongRepository phongRepository;
    private final HopDongRepository hopDongRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<AreaWithRoomCountDto> layDanhSach() {
        return khuVucRepository.findAll().stream()
                .map(khuVuc -> {
                    long soPhong = phongRepository.countByKhuVuc_Id(khuVuc.getId());
                    boolean coTheXoa = hopDongRepository.countByPhong_KhuVuc_IdAndTrangThai(khuVuc.getId(), TrangThaiHopDong.ACTIVE) == 0;
                    return new AreaWithRoomCountDto(khuVuc.getId(), khuVuc.getTen(), khuVuc.getDiaChi(), khuVuc.getMoTa(), soPhong, coTheXoa);
                })
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public KhuVuc tao(@RequestBody KhuVuc khuVuc) {
        return khuVucRepository.save(khuVuc);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KhuVuc> capNhat(@PathVariable("id") String ma, @RequestBody KhuVuc khuVuc) {
        return khuVucRepository.findById(ma)
                .map(hienTai -> {
                    hienTai.setTen(khuVuc.getTen());
                    hienTai.setDiaChi(khuVuc.getDiaChi());
                    hienTai.setMoTa(khuVuc.getMoTa());
                    return ResponseEntity.ok(khuVucRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> xoa(@PathVariable("id") String ma) {
        if (hopDongRepository.countByPhong_KhuVuc_IdAndTrangThai(ma, TrangThaiHopDong.ACTIVE) > 0) {
            return ResponseEntity.badRequest()
                    .body("Không thể xóa khu khi còn phòng đang được thuê. Vui lòng kết thúc hoặc hủy hợp đồng trước.");
        }
        khuVucRepository.deleteById(ma);
        return ResponseEntity.ok().build();
    }
}
