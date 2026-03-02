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
import com.motelmanagement.repository.KhoKhuVuc;
import com.motelmanagement.repository.KhoHopDong;
import com.motelmanagement.repository.KhoPhong;

import lombok.RequiredArgsConstructor;

/** API khu vực (kèm số phòng). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/areas")
public class KhuVucController {
    private final KhoKhuVuc khoKhuVuc;
    private final KhoPhong khoPhong;
    private final KhoHopDong khoHopDong;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<AreaWithRoomCountDto> layDanhSach() {
        return khoKhuVuc.findAll().stream()
                .map(khuVuc -> {
                    long soPhong = khoPhong.countByKhuVuc_Id(khuVuc.getId());
                    boolean coTheXoa = khoHopDong.countByPhong_KhuVuc_IdAndStatus(khuVuc.getId(), TrangThaiHopDong.ACTIVE) == 0;
                    return new AreaWithRoomCountDto(khuVuc.getId(), khuVuc.getName(), khuVuc.getAddress(), khuVuc.getDescription(), soPhong, coTheXoa);
                })
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public KhuVuc tao(@RequestBody KhuVuc khuVuc) {
        return khoKhuVuc.save(khuVuc);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KhuVuc> capNhat(@PathVariable("id") Long ma, @RequestBody KhuVuc khuVuc) {
        return khoKhuVuc.findById(ma)
                .map(hienTai -> {
                    hienTai.setName(khuVuc.getName());
                    hienTai.setAddress(khuVuc.getAddress());
                    hienTai.setDescription(khuVuc.getDescription());
                    return ResponseEntity.ok(khoKhuVuc.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> xoa(@PathVariable("id") Long ma) {
        if (khoHopDong.countByPhong_KhuVuc_IdAndStatus(ma, TrangThaiHopDong.ACTIVE) > 0) {
            return ResponseEntity.badRequest()
                    .body("Không thể xóa khu khi còn phòng đang được thuê. Vui lòng kết thúc hoặc hủy hợp đồng trước.");
        }
        khoKhuVuc.deleteById(ma);
        return ResponseEntity.ok().build();
    }
}
