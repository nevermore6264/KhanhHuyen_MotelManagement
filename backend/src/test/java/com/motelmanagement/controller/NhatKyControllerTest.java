package com.motelmanagement.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.motelmanagement.repository.NhatKyHeThongRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.support.KiemThuSliceWebMvc;

@WebMvcTest(controllers = NhatKyController.class)
@Import(KiemThuSliceWebMvc.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class NhatKyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NhatKyHeThongRepository nhatKyHeThongRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private TienIchJwt tienIchJwt;

    @Test
    @WithMockUser(roles = "ADMIN")
    void layDanhSach_tra200() throws Exception {
        when(nhatKyHeThongRepository.findAll()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/nhat-ky"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_staff403() throws Exception {
        mockMvc.perform(get("/api/nhat-ky"))
                .andExpect(status().isForbidden());
    }
}
