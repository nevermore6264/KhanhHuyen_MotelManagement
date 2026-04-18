package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.motelmanagement.config.ThuocTinhSms;

@ExtendWith(MockitoExtension.class)
class SmsServiceTest {

    @Mock
    private ThuocTinhSms thuocTinhSms;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private SmsService smsService;

    @Test
    void chuanHoaSoChoEsms_null_traRong() {
        assertEquals("", SmsService.chuanHoaSoChoEsms(null));
    }

    @Test
    void chuanHoaSoChoEsms_84() {
        assertEquals("0912345678", SmsService.chuanHoaSoChoEsms("84912345678"));
    }

    @Test
    void chuanHoaSoChoEsms_cong84() {
        assertEquals("0912345678", SmsService.chuanHoaSoChoEsms("+84912345678"));
    }

    @Test
    void isConfigured_khiTat() {
        org.mockito.Mockito.when(thuocTinhSms.isEnabled()).thenReturn(false);
        assertFalse(smsService.isConfigured());
    }

    @Test
    void gui_khiChuaCauHinh_boQuaVaTraTrue() {
        org.mockito.Mockito.when(thuocTinhSms.isEnabled()).thenReturn(false);
        assertTrue(smsService.gui("090", "nội dung"));
    }

    @Test
    void gui_smsType2ThieuBrandname_traFalse() {
        org.mockito.Mockito.when(thuocTinhSms.isEnabled()).thenReturn(true);
        org.mockito.Mockito.when(thuocTinhSms.getApiUrl()).thenReturn("https://api.example/sms");
        org.mockito.Mockito.when(thuocTinhSms.getApiKey()).thenReturn("k");
        org.mockito.Mockito.when(thuocTinhSms.getBasicPassword()).thenReturn("s");
        org.mockito.Mockito.when(thuocTinhSms.getSmsType()).thenReturn(2);
        org.mockito.Mockito.when(thuocTinhSms.getSender()).thenReturn("");

        assertFalse(smsService.gui("0912345678", "test"));
        assertTrue(smsService.layLoiGanNhat().contains("Brandname"));
    }

    @Test
    void gui_soDienThoaiRongSauChuanHoa_traFalse() {
        org.mockito.Mockito.when(thuocTinhSms.isEnabled()).thenReturn(true);
        org.mockito.Mockito.when(thuocTinhSms.getApiUrl()).thenReturn("https://api.example/sms");
        org.mockito.Mockito.when(thuocTinhSms.getApiKey()).thenReturn("k");
        org.mockito.Mockito.when(thuocTinhSms.getBasicPassword()).thenReturn("s");
        org.mockito.Mockito.when(thuocTinhSms.getSmsType()).thenReturn(4);
        org.mockito.Mockito.when(thuocTinhSms.getSender()).thenReturn("BRAND");

        assertFalse(smsService.gui("+++", "x"));
    }
}
