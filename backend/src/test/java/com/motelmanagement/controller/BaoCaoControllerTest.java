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

import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.domain.TrangThaiPhong;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.service.TinhTienService;
import com.motelmanagement.support.KiemThuSliceWebMvc;

@WebMvcTest(controllers = BaoCaoController.class)
@Import(KiemThuSliceWebMvc.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class BaoCaoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HoaDonRepository hoaDonRepository;
    @MockitoBean
    private PhongRepository phongRepository;
    @MockitoBean
    private TinhTienService tinhTienService;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private TienIchJwt tienIchJwt;

    @Test
    @WithMockUser(roles = "STAFF")
    void doanhThu_tra200() throws Exception {
        when(hoaDonRepository.findByThangAndNam(4, 2026)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/bao-cao/doanh-thu").param("month", "4").param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value(4))
                .andExpect(jsonPath("$.year").value(2026))
                .andExpect(jsonPath("$.revenue").exists());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void phongTrong_tra200() throws Exception {
        when(phongRepository.findByTrangThai(TrangThaiPhong.AVAILABLE)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/bao-cao/phong-trong"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vacantRooms").value(0));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void congNo_tra200() throws Exception {
        when(hoaDonRepository.findByTrangThai(TrangThaiHoaDon.UNPAID)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/bao-cao/cong-no"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDebt").exists())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void doanhThu_forbidden() throws Exception {
        mockMvc.perform(get("/api/bao-cao/doanh-thu").param("month", "1").param("year", "2026"))
                .andExpect(status().isForbidden());
    }
}
