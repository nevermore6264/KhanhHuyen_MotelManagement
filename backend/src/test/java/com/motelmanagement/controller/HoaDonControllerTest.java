package com.motelmanagement.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.repository.ChiSoDienNuocRepository;
import com.motelmanagement.repository.HoaDonChiTietRepository;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.NhacNoHoaDonEmailRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.service.HoaDonChiTietService;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.service.NhacNoHoaDonService;
import com.motelmanagement.service.TinhTienService;
import com.motelmanagement.support.KiemThuSliceWebMvc;

@WebMvcTest(controllers = HoaDonController.class)
@Import(KiemThuSliceWebMvc.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class HoaDonControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private HoaDonRepository hoaDonRepository;
    @MockitoBean
    private HoaDonChiTietRepository hoaDonChiTietRepository;
    @MockitoBean
    private ChiSoDienNuocRepository chiSoDienNuocRepository;
    @MockitoBean
    private HopDongRepository hopDongRepository;
    @MockitoBean
    private KhachThueRepository khachThueRepository;
    @MockitoBean
    private NhacNoHoaDonEmailRepository nhacNoHoaDonEmailRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private NhacNoHoaDonService nhacNoHoaDonService;
    @MockitoBean
    private TinhTienService tinhTienService;
    @MockitoBean
    private HoaDonChiTietService hoaDonChiTietService;
    @MockitoBean
    private TienIchJwt tienIchJwt;

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_tra200() throws Exception {
        when(hoaDonRepository.findAllWithTenantAndRoom()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/hoa-don"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layHoaDonCuaToi_khongCoKhach_traRong() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setId("1");
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);
        when(khachThueRepository.findByNguoiDung_Id("1")).thenReturn(null);
        mockMvc.perform(get("/api/hoa-don/cua-toi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void tao_tra200() throws Exception {
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(inv -> {
            HoaDon h = inv.getArgument(0);
            if (h.getId() == null) {
                h.setId("new-id");
            }
            return h;
        });
        mockMvc.perform(post("/api/hoa-don")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"thang\":4,\"nam\":2026}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void luuChiTiet_khongTimThay_tra404() throws Exception {
        doThrow(new IllegalArgumentException("not found")).when(hoaDonChiTietService).luuChiTiet(anyString(), any());
        mockMvc.perform(put("/api/hoa-don/HD-1/chi-tiet")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dong\":[]}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void luuChiTiet_thanhCong() throws Exception {
        doNothing().when(hoaDonChiTietService).luuChiTiet(anyString(), any());
        mockMvc.perform(put("/api/hoa-don/HD-1/chi-tiet")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dong\":[]}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void capNhatTrangThai_tra200() throws Exception {
        HoaDon hd = new HoaDon();
        hd.setId("HD-1");
        hd.setTrangThai(TrangThaiHoaDon.UNPAID);
        when(hoaDonRepository.findById("HD-1")).thenReturn(Optional.of(hd));
        when(hoaDonRepository.save(any(HoaDon.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/hoa-don/HD-1/trang-thai").param("status", "PAID"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trangThai").value("PAID"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void sinhHoaDonNgay() throws Exception {
        when(tinhTienService.sinhHoaDonChoThang(anyInt(), anyInt()))
                .thenReturn(0);
        mockMvc.perform(post("/api/hoa-don/sinh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.created").value(0));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void guiNhacNo_loi_tra400() throws Exception {
        when(nhacNoHoaDonService.guiNhacNo("HD-1", "sms")).thenReturn(Optional.of("Kênh không hợp lệ"));
        mockMvc.perform(post("/api/hoa-don/HD-1/nhac-no")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"channel\":\"sms\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Kênh không hợp lệ"));
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layDanhSach_forbidden() throws Exception {
        mockMvc.perform(get("/api/hoa-don"))
                .andExpect(status().isForbidden());
    }
}
