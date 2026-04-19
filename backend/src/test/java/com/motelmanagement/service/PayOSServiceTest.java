package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.motelmanagement.config.ThuocTinhPayOS;
import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.repository.DonHangPayOSRepository;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.ThanhToanRepository;

@ExtendWith(MockitoExtension.class)
class PayOSServiceTest {

    @Mock
    private ThuocTinhPayOS thuocTinhPayOS;
    @Mock
    private DonHangPayOSRepository donHangPayOSRepository;
    @Mock
    private HoaDonRepository hoaDonRepository;
    @Mock
    private ThanhToanRepository thanhToanRepository;
    @Mock
    private TinhTienService tinhTienService;

    @InjectMocks
    private PayOSService payOSService;

    @Test
    void taoLinkThanhToan_sauTinhTienNull_traNull() {
        HoaDon hd = new HoaDon();
        when(tinhTienService.tinhTienRuntime(hd)).thenReturn(null);
        assertNull(payOSService.taoLinkThanhToan(hd));
    }

    @Test
    void taoLinkThanhToan_thieuClientId_traNull() {
        HoaDon hd = new HoaDon();
        hd.setTongTien(BigDecimal.valueOf(100));
        when(tinhTienService.tinhTienRuntime(hd)).thenReturn(hd);
        when(thuocTinhPayOS.getClientId()).thenReturn("");
        assertNull(payOSService.taoLinkThanhToan(hd));
    }

    @Test
    void taoLinkThanhToan_soTienKhongDuong_traNull() {
        HoaDon hd = new HoaDon();
        hd.setTongTien(BigDecimal.ZERO);
        when(tinhTienService.tinhTienRuntime(hd)).thenReturn(hd);
        when(thuocTinhPayOS.getClientId()).thenReturn("id");
        when(thuocTinhPayOS.getApiKey()).thenReturn("k");
        when(thuocTinhPayOS.getChecksumKey()).thenReturn("c");
        assertNull(payOSService.taoLinkThanhToan(hd));
    }

    @Test
    void xacNhanWebhookVoiPayOS_thieuWebhookUrl_traFalse() {
        when(thuocTinhPayOS.getWebhookUrl()).thenReturn("  ");
        assertFalse(payOSService.xacNhanWebhookVoiPayOS());
    }

    @Test
    void xacThucVaXuLyWebhook_bodyNull_traFalse() {
        when(thuocTinhPayOS.getChecksumKey()).thenReturn("key");
        assertFalse(payOSService.xacThucVaXuLyWebhook(null));
    }

    @Test
    void xacThucVaXuLyWebhook_checksumRong_traFalse() {
        when(thuocTinhPayOS.getChecksumKey()).thenReturn("");
        assertFalse(payOSService.xacThucVaXuLyWebhook("{}"));
    }

    @Test
    void xacThucVaXuLyWebhook_jsonKhongHopLe_traFalse() {
        when(thuocTinhPayOS.getChecksumKey()).thenReturn("key");
        assertFalse(payOSService.xacThucVaXuLyWebhook("not-json"));
    }
}
