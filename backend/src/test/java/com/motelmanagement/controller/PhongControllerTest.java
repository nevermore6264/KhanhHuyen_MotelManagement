package com.motelmanagement.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

import com.motelmanagement.domain.KhuVuc;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.TrangThaiPhong;
import com.motelmanagement.repository.KhuVucRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.support.KiemThuSliceWebMvc;

@WebMvcTest(controllers = PhongController.class)
@Import(KiemThuSliceWebMvc.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class PhongControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PhongRepository phongRepository;
    @MockitoBean
    private KhuVucRepository khuVucRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private TienIchJwt tienIchJwt;

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_tra200() throws Exception {
        when(phongRepository.findAll()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/phong"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void layPhongCoHopDongActive() throws Exception {
        when(phongRepository.findDistinctByHopDong_TrangThai(TrangThaiHopDong.ACTIVE))
                .thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/phong/co-hop-dong-active"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSachConTrong() throws Exception {
        when(phongRepository.findByTrangThai(TrangThaiPhong.AVAILABLE)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/phong/con-trong"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void tao_phong() throws Exception {
        KhuVuc khu = new KhuVuc();
        khu.setId(1L);
        when(khuVucRepository.findById(1L)).thenReturn(java.util.Optional.of(khu));
        when(phongRepository.save(any(Phong.class))).thenAnswer(inv -> {
            Phong p = inv.getArgument(0);
            p.setId(10L);
            p.setMaPhong("P01");
            return p;
        });

        mockMvc.perform(post("/api/phong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"maPhong\":\"P01\",\"khuVuc\":{\"id\":1},\"trangThai\":\"AVAILABLE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maPhong").value("P01"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void tao_staff403() throws Exception {
        mockMvc.perform(post("/api/phong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void xoa_staff403() throws Exception {
        mockMvc.perform(delete("/api/phong/1"))
                .andExpect(status().isForbidden());
    }
}
