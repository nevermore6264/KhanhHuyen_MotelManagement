package com.motelmanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.ThongBao;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.repository.ThongBaoRepository;

@ExtendWith(MockitoExtension.class)
class ThongBaoServiceTest {

    @Mock
    private HoaDonRepository hoaDonRepository;
    @Mock
    private ThongBaoRepository thongBaoRepository;
    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ThongBaoService thongBaoService;

    @Test
    void taoVaDay_tinNhanTrong_boQua() {
        thongBaoService.taoVaDay("   ", null);
        verify(thongBaoRepository, never()).save(any());
    }

    @Test
    void taoVaDay_tinNhanNull_boQua() {
        thongBaoService.taoVaDay(null, 1L);
        verify(thongBaoRepository, never()).save(any());
    }

    @Test
    void taoVaDay_guiTatCaUser() {
        NguoiDung nd = new NguoiDung();
        nd.setId(1L);
        nd.setTenDangNhap("tenant1");
        when(nguoiDungRepository.findAll()).thenReturn(List.of(nd));
        when(thongBaoRepository.save(any(ThongBao.class))).thenAnswer(inv -> {
            ThongBao tb = inv.getArgument(0);
            tb.setId(42L);
            return tb;
        });

        thongBaoService.taoVaDay("  Nội dung  ", null);

        verify(thongBaoRepository).save(any(ThongBao.class));
        verify(messagingTemplate).convertAndSendToUser(eq("tenant1"), eq("/queue/notifications"), any());
    }

    @Test
    void taoVaDay_userId_khongTonTai() {
        when(nguoiDungRepository.findById(999L)).thenReturn(Optional.empty());
        thongBaoService.taoVaDay("msg", 999L);
        verify(thongBaoRepository, never()).save(any());
    }
}
