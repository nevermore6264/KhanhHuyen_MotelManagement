package com.motelmanagement.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.motelmanagement.domain.KhuVuc;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.KhuVucRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.support.KiemThuSliceWebMvc;

@WebMvcTest(controllers = KhuVucController.class)
@Import(KiemThuSliceWebMvc.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class KhuVucControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private KhuVucRepository khuVucRepository;
    @MockitoBean
    private PhongRepository phongRepository;
    @MockitoBean
    private HopDongRepository hopDongRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private TienIchJwt tienIchJwt;

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_tra200() throws Exception {
        KhuVuc k = new KhuVuc();
        k.setId("1");
        k.setTen("Khu A");
        k.setDiaChi("HN");
        k.setMoTa("m");
        when(khuVucRepository.findAll()).thenReturn(List.of(k));
        when(phongRepository.countByKhuVuc_Id("1")).thenReturn(3L);
        when(hopDongRepository.countByPhong_KhuVuc_IdAndTrangThai("1", TrangThaiHopDong.ACTIVE)).thenReturn(0L);

        mockMvc.perform(get("/api/khu-vuc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ten").value("Khu A"))
                .andExpect(jsonPath("$[0].soPhong").value(3));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void xoa_conHopDongActive_tra400() throws Exception {
        when(hopDongRepository.countByPhong_KhuVuc_IdAndTrangThai("5", TrangThaiHopDong.ACTIVE)).thenReturn(1L);
        mockMvc.perform(delete("/api/khu-vuc/5"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void xoa_forbidden() throws Exception {
        mockMvc.perform(delete("/api/khu-vuc/1"))
                .andExpect(status().isForbidden());
    }
}
