package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.mail.internet.MimeMessage;

import com.motelmanagement.config.ThuocTinhMail;
import com.motelmanagement.domain.*;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.NhacNoHoaDonEmailRepository;

@ExtendWith(MockitoExtension.class)
class NhacNoHoaDonServiceTest {

    @Mock
    private HoaDonRepository hoaDonRepository;
    @Mock
    private NhacNoHoaDonEmailRepository nhacNoHoaDonEmailRepository;
    @Mock
    private HopDongRepository hopDongRepository;
    @Mock
    private ThuocTinhMail thuocTinhMail;
    @Mock
    private TinhTienService tinhTienService;
    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private NhacNoHoaDonService service;

    private HoaDon hoaDon;

    @BeforeEach
    void setup() {
        hoaDon = new HoaDon();
        hoaDon.setTrangThai(TrangThaiHoaDon.UNPAID);
        hoaDon.setThang(6);
        hoaDon.setNam(2026);

        Phong phong = new Phong();
        phong.setId(1L);
        phong.setMaPhong("P101");
        hoaDon.setPhong(phong);

        KhachThue khach = new KhachThue();
        khach.setId(1L);
        khach.setHoTen("Nguyen Van A");
        khach.setEmail("test@gmail.com");

        hoaDon.setKhachThue(khach);

        ReflectionTestUtils.setField(service, "javaMailSender", javaMailSender);
    }

    @Test
    void guiNhacNo_kenhKhongHopLe() {
        assertTrue(service.guiNhacNo("HD1", "sms").orElse("").contains("Kênh"));
    }

    @Test
    void guiNhacNo_khongTimThayHoaDon() {
        when(hoaDonRepository.timTheoIdCoPhong("X")).thenReturn(Optional.empty());

        String result = service.guiNhacNo("X", "email").orElse("");
        assertTrue(result.contains("Không tìm thấy"));
    }

    @Test
    void guiNhacNo_hoaDonDaThanhToan() {
        hoaDon.setTrangThai(TrangThaiHoaDon.PAID);

        when(hoaDonRepository.timTheoIdCoPhong("H1")).thenReturn(Optional.of(hoaDon));
        when(tinhTienService.tinhTienRuntime(hoaDon)).thenReturn(hoaDon);

        String result = service.guiNhacNo("H1", "email").orElse("");
        assertTrue(result.contains("đã thanh toán"));
    }

    @Test
    void guiNhacNo_khongCoKhach() {
        hoaDon.setKhachThue(null);

        when(hoaDonRepository.timTheoIdCoPhong("H2")).thenReturn(Optional.of(hoaDon));
        when(tinhTienService.tinhTienRuntime(hoaDon)).thenReturn(hoaDon);
        when(hopDongRepository.findByPhong_IdAndTrangThai(anyLong(), any()))
                .thenReturn(Optional.empty());

        String result = service.guiNhacNo("H2", "email").orElse("");
        assertTrue(result.contains("chưa gắn khách"));
    }

    @Test
    void guiNhacNo_khachKhongCoEmail() {
        hoaDon.getKhachThue().setEmail(null);

        when(hoaDonRepository.timTheoIdCoPhong("H3")).thenReturn(Optional.of(hoaDon));
        when(tinhTienService.tinhTienRuntime(hoaDon)).thenReturn(hoaDon);

        String result = service.guiNhacNo("H3", "email").orElse("");
        assertTrue(result.contains("có email để gửi nhắc nợ"));
    }

    @Test
    void guiNhacNo_guiThanhCong() throws Exception {
        when(hoaDonRepository.timTheoIdCoPhong("H4")).thenReturn(Optional.of(hoaDon));
        when(tinhTienService.tinhTienRuntime(hoaDon)).thenReturn(hoaDon);
        when(thuocTinhMail.getFrom()).thenReturn("admin@test.com");

        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        Optional<String> result = service.guiNhacNo("H4", "email");

        assertTrue(result.isEmpty());
        verify(nhacNoHoaDonEmailRepository).save(any());
    }

    @Test
    void guiNhacNo_khongCoMailSender_vanLuuBanGhiEmail() {
        NhacNoHoaDonService khongMail = new NhacNoHoaDonService(
                hoaDonRepository,
                nhacNoHoaDonEmailRepository,
                hopDongRepository,
                thuocTinhMail,
                tinhTienService);

        when(hoaDonRepository.timTheoIdCoPhong("H5")).thenReturn(Optional.of(hoaDon));
        when(tinhTienService.tinhTienRuntime(hoaDon)).thenReturn(hoaDon);

        Optional<String> result = khongMail.guiNhacNo("H5", "email");

        assertTrue(result.isEmpty());
        verify(nhacNoHoaDonEmailRepository).save(any());
    }
}
