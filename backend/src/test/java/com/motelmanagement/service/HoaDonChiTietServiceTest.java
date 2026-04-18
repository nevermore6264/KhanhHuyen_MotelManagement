package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motelmanagement.dto.YeuCauLuuChiTietHoaDon;
import com.motelmanagement.repository.HoaDonChiTietRepository;
import com.motelmanagement.repository.HoaDonRepository;

@ExtendWith(MockitoExtension.class)
class HoaDonChiTietServiceTest {

    @Mock
    private HoaDonRepository hoaDonRepository;
    @Mock
    private HoaDonChiTietRepository hoaDonChiTietRepository;

    @InjectMocks
    private HoaDonChiTietService hoaDonChiTietService;

    @Test
    void luuChiTiet_khongTimThayHoaDon_throws() {
        when(hoaDonRepository.findById("HD-x")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> hoaDonChiTietService.luuChiTiet("HD-x", new YeuCauLuuChiTietHoaDon()));
    }

    @Test
    void luuChiTiet_yeuCauNull_goEarlyReturn() {
        com.motelmanagement.domain.HoaDon hd = new com.motelmanagement.domain.HoaDon();
        when(hoaDonRepository.findById("HD-1")).thenReturn(Optional.of(hd));
        assertDoesNotThrow(() -> hoaDonChiTietService.luuChiTiet("HD-1", null));
        verify(hoaDonChiTietRepository).deleteByHoaDon_Id("HD-1");
    }
}
