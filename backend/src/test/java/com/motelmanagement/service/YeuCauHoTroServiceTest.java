package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.YeuCauHoTro;
import com.motelmanagement.repository.HopDongRepository;

@ExtendWith(MockitoExtension.class)
class YeuCauHoTroServiceTest {

    @Mock
    private HopDongRepository hopDongRepository;

    @InjectMocks
    private YeuCauHoTroService yeuCauHoTroService;

    @Test
    void boSungPhongTuHopDong_khiChuaCoPhong() {
        KhachThue khach = new KhachThue();
        khach.setId("K1");
        Phong phong = new Phong();
        phong.setId("P1");
        phong.setMaPhong("A101");
        HopDong hd = new HopDong();
        hd.setTrangThai(TrangThaiHopDong.ACTIVE);
        hd.setPhong(phong);

        YeuCauHoTro yeuCau = new YeuCauHoTro();
        yeuCau.setKhachThue(khach);

        when(hopDongRepository.findThuocKhachThueCoPhong("K1")).thenReturn(List.of(hd));

        yeuCauHoTroService.boSungPhongTuHopDong(List.of(yeuCau));

        assertEquals("P1", yeuCau.getPhong().getId());
        assertEquals("A101", yeuCau.getPhong().getMaPhong());
    }

    @Test
    void layPhongTuHopDongActive_khongCoHopDong_traNull() {
        when(hopDongRepository.findThuocKhachThueCoPhong("K2")).thenReturn(List.of());
        assertNull(yeuCauHoTroService.layPhongTuHopDongActive("K2"));
    }
}
