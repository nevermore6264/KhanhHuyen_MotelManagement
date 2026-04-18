package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.NhatKyHeThong;
import com.motelmanagement.repository.NhatKyHeThongRepository;

@ExtendWith(MockitoExtension.class)
class NhatKyServiceTest {

    @Mock
    private NhatKyHeThongRepository nhatKyHeThongRepository;

    @InjectMocks
    private NhatKyService nhatKyService;

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.service.NhatKyService", NhatKyService.class.getName());
    }

    @Test
    void ghiNhatKy_luuBanGhi() {
        NguoiDung nd = new NguoiDung();
        nd.setId(1L);
        nd.setTenDangNhap("u1");
        when(nhatKyHeThongRepository.save(any(NhatKyHeThong.class))).thenAnswer(i -> i.getArgument(0));

        nhatKyService.ghiNhatKy(nd, "POST", "HoaDon", "1", "test");
        verify(nhatKyHeThongRepository).save(any(NhatKyHeThong.class));
    }
}
