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
import com.motelmanagement.domain.KhuVuc;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.dto.DtoNguoiDungChoThongBao;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.NguoiDungRepository;

@ExtendWith(MockitoExtension.class)
class NguoiDungChoThongBaoServiceTest {

    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @Mock
    private KhachThueRepository khachThueRepository;
    @Mock
    private HopDongRepository hopDongRepository;

    @InjectMocks
    private NguoiDungChoThongBaoService nguoiDungChoThongBaoService;

    @Test
    void layDanhSach_khongGanKhach() {
        NguoiDung nd = new NguoiDung();
        nd.setId(1L);
        nd.setTenDangNhap("u");
        nd.setHoTen("T");
        nd.setVaiTro(VaiTro.TENANT);
        when(nguoiDungRepository.findAll()).thenReturn(List.of(nd));
        when(khachThueRepository.findByNguoiDung_Id(1L)).thenReturn(null);

        List<DtoNguoiDungChoThongBao> list = nguoiDungChoThongBaoService.layDanhSach();

        assertEquals(1, list.size());
        assertNull(list.get(0).getPhongHienThue());
        assertNull(list.get(0).getKhuHienThue());
    }

    @Test
    void layDanhSach_coHopDongActive() {
        KhuVuc khu = new KhuVuc();
        khu.setTen("Khu A");
        Phong phong = new Phong();
        phong.setMaPhong("P101");
        phong.setKhuVuc(khu);
        HopDong hd = new HopDong();
        hd.setTrangThai(TrangThaiHopDong.ACTIVE);
        hd.setPhong(phong);

        KhachThue kt = new KhachThue();
        kt.setId(10L);

        NguoiDung nd = new NguoiDung();
        nd.setId(2L);
        nd.setTenDangNhap("renter");
        nd.setHoTen("R");
        nd.setVaiTro(VaiTro.TENANT);

        when(nguoiDungRepository.findAll()).thenReturn(List.of(nd));
        when(khachThueRepository.findByNguoiDung_Id(2L)).thenReturn(kt);
        when(hopDongRepository.findThuocKhachThueCoPhong(10L)).thenReturn(List.of(hd));

        List<DtoNguoiDungChoThongBao> list = nguoiDungChoThongBaoService.layDanhSach();

        assertEquals("P101", list.get(0).getPhongHienThue());
        assertEquals("Khu A", list.get(0).getKhuHienThue());
    }
}
