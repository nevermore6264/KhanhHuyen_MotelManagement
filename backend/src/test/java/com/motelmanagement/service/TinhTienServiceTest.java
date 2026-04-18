package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDate;
import java.util.Optional;

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
}
