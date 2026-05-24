package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motelmanagement.config.ThuocTinhMail;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.PhieuDatLaiMatKhau;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.dto.PhanHoiQuenMatKhau;
import com.motelmanagement.dto.PhanHoiXacThuc;
import com.motelmanagement.dto.YeuCauDangKy;
import com.motelmanagement.dto.YeuCauDatLaiMatKhau;
import com.motelmanagement.dto.YeuCauQuenMatKhau;
import com.motelmanagement.dto.YeuCauXacThuc;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.repository.PhieuDatLaiMatKhauRepository;
import com.motelmanagement.security.TienIchJwt;

import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class XacThucServiceTest {

    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @Mock
    private PhieuDatLaiMatKhauRepository phieuDatLaiMatKhauRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TienIchJwt tienIchJwt;
    @Mock
    private ThuocTinhMail thuocTinhMail;

    @InjectMocks
    private XacThucService xacThucService;

    @Test
    void dangNhap_thanhCong() {
        NguoiDung nd = new NguoiDung();
        nd.setTenDangNhap("user1");
        nd.setMatKhau("hash");
        nd.setKichHoat(true);
        nd.setVaiTro(VaiTro.ADMIN);
        nd.setHoTen("A");
        when(nguoiDungRepository.findByTenDangNhap("user1")).thenReturn(Optional.of(nd));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(tienIchJwt.generateToken("user1", "ADMIN")).thenReturn("jwt-token");

        YeuCauXacThuc y = new YeuCauXacThuc();
        y.setTenDangNhap("user1");
        y.setMatKhau("secret");
        PhanHoiXacThuc r = xacThucService.dangNhap(y);

        assertEquals("jwt-token", r.getToken());
        assertEquals("ADMIN", r.getVaiTro());
        assertEquals("A", r.getHoTen());
    }

    @Test
    void dangNhap_saiMatKhau() {
        NguoiDung nd = new NguoiDung();
        nd.setTenDangNhap("u");
        nd.setMatKhau("hash");
        nd.setKichHoat(true);
        nd.setVaiTro(VaiTro.ADMIN);
        when(nguoiDungRepository.findByTenDangNhap("u")).thenReturn(Optional.of(nd));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        YeuCauXacThuc y = new YeuCauXacThuc();
        y.setTenDangNhap("u");
        y.setMatKhau("wrong");
        assertThrows(IllegalArgumentException.class, () -> xacThucService.dangNhap(y));
    }

    @Test
    void dangNhap_taiKhoanChuaKichHoat() {
        NguoiDung nd = new NguoiDung();
        nd.setTenDangNhap("u");
        nd.setMatKhau("hash");
        nd.setKichHoat(false);
        nd.setVaiTro(VaiTro.ADMIN);
        when(nguoiDungRepository.findByTenDangNhap("u")).thenReturn(Optional.of(nd));

        YeuCauXacThuc y = new YeuCauXacThuc();
        y.setTenDangNhap("u");
        y.setMatKhau("p");
        assertThrows(IllegalArgumentException.class, () -> xacThucService.dangNhap(y));
    }

    @Test
    void dangKy_trungTenDangNhap() {
        when(nguoiDungRepository.findByTenDangNhap("dup")).thenReturn(Optional.of(new NguoiDung()));
        YeuCauDangKy y = new YeuCauDangKy();
        y.setTenDangNhap("dup");
        y.setMatKhau("p");
        y.setHoTen("X");
        y.setVaiTro(VaiTro.TENANT);
        assertThrows(IllegalArgumentException.class, () -> xacThucService.dangKy(y));
    }

    @Test
    void dangKy_luu() {
        when(nguoiDungRepository.findByTenDangNhap("newu")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("p")).thenReturn("hash");
        when(nguoiDungRepository.save(any(NguoiDung.class))).thenAnswer(inv -> inv.getArgument(0));

        YeuCauDangKy y = new YeuCauDangKy();
        y.setTenDangNhap("newu");
        y.setMatKhau("p");
        y.setHoTen("Tên");
        y.setVaiTro(VaiTro.TENANT);
        NguoiDung saved = xacThucService.dangKy(y);

        assertEquals("newu", saved.getTenDangNhap());
        assertEquals("hash", saved.getMatKhau());
        assertTrue(saved.isKichHoat());
    }

    @Test
    void quenMatKhau_khongCoEmail() {
        when(nguoiDungRepository.findByEmailIgnoreCaseTrimmed("ghost@test.com"))
                .thenReturn(Optional.empty());
        YeuCauQuenMatKhau y = new YeuCauQuenMatKhau();
        y.setEmail("ghost@test.com");
        PhanHoiQuenMatKhau r = xacThucService.quenMatKhau(y);
        assertTrue(r.getMessage().contains("Nếu email"));
        assertNull(r.getDevOtp());
    }

    @Test
    void quenMatKhau_taiKhoanCoEmail_khongCoMailSender_traDevOtp() {
        NguoiDung nd = new NguoiDung();
        nd.setId("1");
        nd.setHoTen("A");
        nd.setEmail("a@b.com");
        nd.setKichHoat(true);
        when(nguoiDungRepository.findByEmailIgnoreCaseTrimmed("a@b.com")).thenReturn(Optional.of(nd));

        YeuCauQuenMatKhau y = new YeuCauQuenMatKhau();
        y.setEmail("a@b.com");
        PhanHoiQuenMatKhau r = xacThucService.quenMatKhau(y);

        assertNotNull(r.getDevOtp());
        assertEquals(6, r.getDevOtp().length());
        verify(phieuDatLaiMatKhauRepository).save(any(PhieuDatLaiMatKhau.class));
    }

    @Test
    void datLaiMatKhau_otpKhongTonTai() {
        when(phieuDatLaiMatKhauRepository.findByEmailAndOtp("a@b.com", "000000"))
                .thenReturn(Optional.empty());
        YeuCauDatLaiMatKhau y = new YeuCauDatLaiMatKhau();
        y.setEmail("a@b.com");
        y.setOtp("000000");
        y.setNewPassword("newpass");
        assertThrows(IllegalArgumentException.class, () -> xacThucService.datLaiMatKhau(y));
    }

    @Test
    void datLaiMatKhau_otpHetHan() {
        PhieuDatLaiMatKhau p = new PhieuDatLaiMatKhau();
        p.setHetHanLuc(LocalDateTime.now().minusMinutes(1));
        when(phieuDatLaiMatKhauRepository.findByEmailAndOtp("a@b.com", "123456"))
                .thenReturn(Optional.of(p));

        YeuCauDatLaiMatKhau y = new YeuCauDatLaiMatKhau();
        y.setEmail("a@b.com");
        y.setOtp("123456");
        y.setNewPassword("newpass");
        assertThrows(IllegalArgumentException.class, () -> xacThucService.datLaiMatKhau(y));
        verify(phieuDatLaiMatKhauRepository).delete(p);
    }

    @Test
    void datLaiMatKhau_thanhCong() {
        NguoiDung nd = new NguoiDung();
        nd.setId("2");
        nd.setTenDangNhap("ok");
        PhieuDatLaiMatKhau p = new PhieuDatLaiMatKhau();
        p.setHetHanLuc(LocalDateTime.now().plusMinutes(10));
        p.setNguoiDung(nd);
        when(phieuDatLaiMatKhauRepository.findByEmailAndOtp("ok@test.com", "123456"))
                .thenReturn(Optional.of(p));
        when(passwordEncoder.encode("newpass")).thenReturn("newhash");

        YeuCauDatLaiMatKhau y = new YeuCauDatLaiMatKhau();
        y.setEmail("ok@test.com");
        y.setOtp("123456");
        y.setNewPassword("newpass");
        xacThucService.datLaiMatKhau(y);

        verify(nguoiDungRepository).save(argThat(u -> "newhash".equals(u.getMatKhau())));
        verify(phieuDatLaiMatKhauRepository).delete(p);
    }
}
