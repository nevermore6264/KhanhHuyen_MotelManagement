package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.HoaDon;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.repository.BangGiaDichVuRepository;
import com.motelmanagement.repository.ChiSoDienNuocRepository;
import com.motelmanagement.repository.HoaDonChiTietRepository;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.HopDongRepository;

@ExtendWith(MockitoExtension.class)
class TinhTienServiceTest {

    @Mock
    private HoaDonRepository hoaDonRepository;
    @Mock
    private HopDongRepository hopDongRepository;
    @Mock
    private ChiSoDienNuocRepository chiSoDienNuocRepository;
    @Mock
    private BangGiaDichVuRepository bangGiaDichVuRepository;
    @Mock
    private HoaDonChiTietRepository hoaDonChiTietRepository;

    @InjectMocks
    private TinhTienService tinhTienService;

    @Test
    void tinhTienRuntime_null_traNull() {
        assertNull(tinhTienService.tinhTienRuntime(null));
    }

    @Test
    void phongCoHopDongActiveChoKy_khongCoHopDong_traFalse() {
        Mockito.when(hopDongRepository.findByPhong_IdAndTrangThai(99L, TrangThaiHopDong.ACTIVE))
                .thenReturn(Optional.empty());
        assertFalse(tinhTienService.phongCoHopDongActiveChoKy(99L, 6, 2026));
    }

    @Test
    void phongCoHopDongActiveChoKy_hopDongSauKy_traFalse() {
        HopDong hd = new HopDong();
        hd.setNgayBatDau(LocalDate.of(2026, 7, 1));
        Mockito.when(hopDongRepository.findByPhong_IdAndTrangThai(1L, TrangThaiHopDong.ACTIVE))
                .thenReturn(Optional.of(hd));
        assertFalse(tinhTienService.phongCoHopDongActiveChoKy(1L, 6, 2026));
    }

    @Test
    void layChiSoDienCuTheoKy_khongCoPhong_tra0() {
        ChiSoDienNuoc chiSo = new ChiSoDienNuoc();
        chiSo.setPhong(null);

        int result = tinhTienService.layChiSoDienCuTheoKy(chiSo);
        assert result == 0;
    }

    @Test
    void layChiSoDienCuTheoKy_coDuLieuThangTruoc() {
        ChiSoDienNuoc chiSo = new ChiSoDienNuoc();
        chiSo.setNam(2026);
        chiSo.setThang(6);

        var phong = new com.motelmanagement.domain.Phong();
        phong.setId(1L);
        chiSo.setPhong(phong);

        ChiSoDienNuoc chiSoTruoc = new ChiSoDienNuoc();
        chiSoTruoc.setDienMoi(150);

        Mockito.when(chiSoDienNuocRepository
                        .findByPhong_IdAndThangAndNam(1L, 5, 2026))
                .thenReturn(Optional.of(chiSoTruoc));

        int result = tinhTienService.layChiSoDienCuTheoKy(chiSo);
        assert result == 150;
    }

    @Test
    void layChiSoNuocCuTheoKy_khongCoDuLieu_tra0() {
        ChiSoDienNuoc chiSo = new ChiSoDienNuoc();
        chiSo.setNam(2026);
        chiSo.setThang(6);

        var phong = new com.motelmanagement.domain.Phong();
        phong.setId(1L);
        chiSo.setPhong(phong);

        Mockito.when(chiSoDienNuocRepository
                        .findByPhong_IdAndThangAndNam(1L, 5, 2026))
                .thenReturn(Optional.empty());

        int result = tinhTienService.layChiSoNuocCuTheoKy(chiSo);
        assert result == 0;
    }

    @Test
    void tinhTienRuntime_coChiSo_dayDuTien() {
        HoaDon hoaDon = new HoaDon();

        var phong = new com.motelmanagement.domain.Phong();
        phong.setId(1L);
        phong.setGiaHienTai(new java.math.BigDecimal("2000000"));
        hoaDon.setPhong(phong);
        hoaDon.setThang(6);
        hoaDon.setNam(2026);

        ChiSoDienNuoc chiSo = new ChiSoDienNuoc();
        chiSo.setDienMoi(200);
        chiSo.setNuocMoi(50);
        chiSo.setPhong(phong);
        chiSo.setThang(6);
        chiSo.setNam(2026);

        ChiSoDienNuoc chiSoTruoc = new ChiSoDienNuoc();
        chiSoTruoc.setDienMoi(100);
        chiSoTruoc.setNuocMoi(20);

        var bangGia = new com.motelmanagement.domain.BangGiaDichVu();
        bangGia.setGiaDien(new java.math.BigDecimal("3000"));
        bangGia.setGiaNuoc(new java.math.BigDecimal("10000"));

        Mockito.when(chiSoDienNuocRepository
                        .findByPhong_IdAndThangAndNam(1L, 6, 2026))
                .thenReturn(Optional.of(chiSo));

        Mockito.when(chiSoDienNuocRepository
                        .findByPhong_IdAndThangAndNam(1L, 5, 2026))
                .thenReturn(Optional.of(chiSoTruoc));

        Mockito.when(bangGiaDichVuRepository
                        .findFirstByOrderByHieuLucTuDesc())
                .thenReturn(Optional.of(bangGia));

        HoaDon result = tinhTienService.tinhTienRuntime(hoaDon);

        assert result.getTienDien().intValue() == 300000; // (200-100)*3000
        assert result.getTienNuoc().intValue() == 300000; // (50-20)*10000
    }

    @Test
    void sinhHoaDonChoThang_taoMoiHoaDon() {
        HopDong hd = new HopDong();
        var phong = new com.motelmanagement.domain.Phong();
        phong.setId(1L);
        hd.setPhong(phong);
        hd.setTrangThai(TrangThaiHopDong.ACTIVE);

        Mockito.when(hopDongRepository.findByTrangThai(TrangThaiHopDong.ACTIVE))
                .thenReturn(List.of(hd));

        Mockito.when(hoaDonRepository
                        .findByPhong_IdAndThangAndNam(1L, 6, 2026))
                .thenReturn(Optional.empty());

        int result = tinhTienService.sinhHoaDonChoThang(6, 2026);

        assert result == 1;
    }
}
