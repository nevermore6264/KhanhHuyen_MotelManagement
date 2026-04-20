package com.motelmanagement.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.dto.GhiNhanThanhToanRequest;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.ThanhToanRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.service.PayOSService;
import com.motelmanagement.service.TinhTienService;
import com.motelmanagement.support.KiemThuSliceWebMvc;

@WebMvcTest(controllers = ThanhToanController.class)
@Import(KiemThuSliceWebMvc.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class ThanhToanControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ThanhToanRepository thanhToanRepository;
    @MockitoBean
    private HoaDonRepository hoaDonRepository;
    @MockitoBean
    private KhachThueRepository khachThueRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private PayOSService payOSService;
    @MockitoBean
    private TinhTienService tinhTienService;
    @MockitoBean
    private TienIchJwt tienIchJwt;

    @Test
    void webhookPayOSThongTin_tra200() throws Exception {
        mockMvc.perform(get("/api/thanh-toan/payos/webhook"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.path").value("/api/thanh-toan/payos/webhook"));
    }

    @Test
    void webhookPayOS_thanhCong_tra200() throws Exception {
        when(payOSService.xacThucVaXuLyWebhook("{\"ok\":true}")).thenReturn(true);
        mockMvc.perform(post("/api/thanh-toan/payos/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ok\":true}"))
                .andExpect(status().isOk());
    }

    @Test
    void webhookPayOS_thatBai_tra400() throws Exception {
        when(payOSService.xacThucVaXuLyWebhook("{}")).thenReturn(false);
        mockMvc.perform(post("/api/thanh-toan/payos/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void ghiNhanThanhToan_thieuDuLieu_tra400() throws Exception {
        mockMvc.perform(post("/api/thanh-toan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void ghiNhanThanhToan_soTienKhongDuong_tra400() throws Exception {
        GhiNhanThanhToanRequest req = new GhiNhanThanhToanRequest();
        req.setInvoiceId("HD-1");
        req.setAmount(BigDecimal.ZERO);
        mockMvc.perform(post("/api/thanh-toan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void ghiNhanThanhToan_khongTimThayHoaDon_tra400() throws Exception {
        GhiNhanThanhToanRequest req = new GhiNhanThanhToanRequest();
        req.setInvoiceId("missing");
        req.setAmount(BigDecimal.valueOf(100_000));
        when(hoaDonRepository.findById("missing")).thenReturn(Optional.empty());
        when(tinhTienService.tinhTienRuntime(null)).thenReturn(null);

        mockMvc.perform(post("/api/thanh-toan")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Không tìm thấy hóa đơn."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void layTheoHoaDon_tra200() throws Exception {
        when(thanhToanRepository.findByHoaDon_Id("INV-1")).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/thanh-toan/hoa-don/INV-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layThanhToanCuaToi_khongCoNguoiDung_tra200Rong() throws Exception {
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(null);
        mockMvc.perform(get("/api/thanh-toan/cua-toi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void taoLinkThanhToan_thieuInvoiceId_tra400() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setId("1");
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);
        mockMvc.perform(post("/api/thanh-toan/tao-link")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void taoLinkThanhToan_traOk() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setId("1");
        KhachThue kt = new KhachThue();
        kt.setId("10");
        HoaDon hd = new HoaDon();
        hd.setId("INV-1");
        hd.setKhachThue(kt);

        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);
        when(khachThueRepository.findByNguoiDung_Id("1")).thenReturn(kt);
        when(hoaDonRepository.findById("INV-1")).thenReturn(Optional.of(hd));
        when(tinhTienService.tinhTienRuntime(hd)).thenReturn(hd);
        when(payOSService.taoLinkThanhToan(hd)).thenReturn("https://pay.example/checkout");

        mockMvc.perform(post("/api/thanh-toan/tao-link")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"invoiceId\":\"INV-1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentUrl").value("https://pay.example/checkout"));
    }
}
