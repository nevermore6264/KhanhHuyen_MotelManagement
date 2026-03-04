package com.motelmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.dto.PhanHoiQuenMatKhau;
import com.motelmanagement.dto.PhanHoiXacThuc;
import com.motelmanagement.dto.YeuCauDangKy;
import com.motelmanagement.dto.YeuCauDatLaiMatKhau;
import com.motelmanagement.dto.YeuCauQuenMatKhau;
import com.motelmanagement.dto.YeuCauXacThuc;
import com.motelmanagement.service.XacThucService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** Bộ điều khiển API xác thực: login, register, forgot-password, reset-password. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/xac-thuc")
public class XacThucController {
    private final XacThucService xacThucService;

    /** Đăng nhập: POST /api/xac-thuc/dang-nhap */
    @PostMapping("/dang-nhap")
    public ResponseEntity<PhanHoiXacThuc> dangNhap(@Valid @RequestBody YeuCauXacThuc yeuCau) {
        return ResponseEntity.ok(xacThucService.dangNhap(yeuCau));
    }

    /** Đăng ký: POST /api/xac-thuc/dang-ky */
    @PostMapping("/dang-ky")
    public ResponseEntity<?> dangKy(@Valid @RequestBody YeuCauDangKy yeuCau) {
        return ResponseEntity.ok(xacThucService.dangKy(yeuCau));
    }

    /** Quên mật khẩu: POST /api/xac-thuc/quen-mat-khau */
    @PostMapping("/quen-mat-khau")
    public ResponseEntity<PhanHoiQuenMatKhau> quenMatKhau(@Valid @RequestBody YeuCauQuenMatKhau yeuCau) {
        return ResponseEntity.ok(xacThucService.quenMatKhau(yeuCau));
    }

    /** Đặt lại mật khẩu: POST /api/xac-thuc/dat-lai-mat-khau */
    @PostMapping("/dat-lai-mat-khau")
    public ResponseEntity<?> datLaiMatKhau(@Valid @RequestBody YeuCauDatLaiMatKhau yeuCau) {
        xacThucService.datLaiMatKhau(yeuCau);
        return ResponseEntity.ok().build();
    }
}
