package com.motelmanagement.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

import com.motelmanagement.repository.BangGiaDichVuRepository;
import com.motelmanagement.repository.ChiSoDienNuocRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.service.TinhTienService;
import com.motelmanagement.support.KiemThuPhuongThucBaoMat;

@WebMvcTest(controllers = ChiSoDienNuocController.class)
@Import(KiemThuPhuongThucBaoMat.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class ChiSoDienNuocControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChiSoDienNuocRepository chiSoDienNuocRepository;
    @MockitoBean
    private PhongRepository phongRepository;
    @MockitoBean
    private BangGiaDichVuRepository bangGiaDichVuRepository;
    @MockitoBean
    private TinhTienService tinhTienService;

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_tra200() throws Exception {
        when(chiSoDienNuocRepository.findAll()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/chi-so-dien-nuoc"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void tao_thieuPhong_tra400() throws Exception {
        mockMvc.perform(post("/api/chi-so-dien-nuoc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"thang\":4,\"nam\":2026}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layDanhSach_forbidden() throws Exception {
        mockMvc.perform(get("/api/chi-so-dien-nuoc"))
                .andExpect(status().isForbidden());
    }
}
