package com.motelmanagement.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;

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

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.support.KiemThuSliceWebMvc;

@WebMvcTest(controllers = HopDongController.class)
@Import(KiemThuSliceWebMvc.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class HopDongControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HopDongRepository hopDongRepository;
    @MockitoBean
    private PhongRepository phongRepository;
    @MockitoBean
    private KhachThueRepository khachThueRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private TienIchJwt tienIchJwt;

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_tra200() throws Exception {
        when(hopDongRepository.findAll()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/hop-dong"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void tao_thieuDuLieu_tra400() throws Exception {
        mockMvc.perform(post("/api/hop-dong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layHopDongCuaToi_khongCoNguoiDung_traRong() throws Exception {
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(null);
        mockMvc.perform(get("/api/hop-dong/cua-toi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void layHopDongCuaToi_forbidden() throws Exception {
        mockMvc.perform(get("/api/hop-dong/cua-toi"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layHopDongCuaToiTheoMa_khongCoKhach_tra404() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setId("1");
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);
        when(khachThueRepository.findByNguoiDung_Id("1")).thenReturn(null);
        mockMvc.perform(get("/api/hop-dong/cua-toi/5"))
                .andExpect(status().isNotFound());
    }
}
