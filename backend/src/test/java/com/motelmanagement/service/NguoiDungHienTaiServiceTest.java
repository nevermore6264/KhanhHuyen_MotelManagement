package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.repository.NguoiDungRepository;

@ExtendWith(MockitoExtension.class)
class NguoiDungHienTaiServiceTest {

    @Mock
    private NguoiDungRepository nguoiDungRepository;

    @InjectMocks
    private NguoiDungHienTaiService nguoiDungHienTaiService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void khiKhongDangNhap_traNull() {
        assertNull(nguoiDungHienTaiService.layNguoiDungHienTai());
    }

    @Test
    void khiCoTenDangNhap_traNguoiDung() {
        NguoiDung nd = new NguoiDung();
        nd.setTenDangNhap("admin");
        when(nguoiDungRepository.findByTenDangNhap("admin")).thenReturn(Optional.of(nd));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        assertEquals("admin", nguoiDungHienTaiService.layNguoiDungHienTai().getTenDangNhap());
    }
}
