package com.motelmanagement.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;
import java.util.List;
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
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.dto.TenantCreateDto;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.service.FileKhachThueService;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.support.KiemThuSliceWebMvc;

@WebMvcTest(controllers = KhachThueController.class)
@Import(KiemThuSliceWebMvc.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class KhachThueControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private KhachThueRepository khachThueRepository;
    @MockitoBean
    private NguoiDungRepository nguoiDungRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private FileKhachThueService fileKhachThueService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private TienIchJwt tienIchJwt;

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_toanBo() throws Exception {
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(null);
        when(khachThueRepository.findAll()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/khach-thue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_timTheoTuKhoa() throws Exception {
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(null);
        when(khachThueRepository.findByHoTenContainingIgnoreCase("An")).thenReturn(List.of());
        mockMvc.perform(get("/api/khach-thue").param("q", "An"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void layThongTinToi_khongCoNguoiDung_tra404() throws Exception {
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(null);
        mockMvc.perform(get("/api/khach-thue/cua-toi"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void tao_json() throws Exception {
        when(khachThueRepository.save(any(KhachThue.class))).thenAnswer(inv -> {
            KhachThue k = inv.getArgument(0);
            k.setId(5L);
            return k;
        });
        TenantCreateDto dto = new TenantCreateDto();
        dto.setFullName("Nguyễn A");
        dto.setPhone("0909123456");
        mockMvc.perform(post("/api/khach-thue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hoTen").value("Nguyễn A"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void capNhat_staff_tra403() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setVaiTro(VaiTro.STAFF);
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);

        KhachThue body = new KhachThue();
        body.setHoTen("X");
        mockMvc.perform(put("/api/khach-thue/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void capNhat_admin_tra200() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setVaiTro(VaiTro.ADMIN);
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);

        KhachThue hienTai = new KhachThue();
        hienTai.setId(1L);
        hienTai.setHoTen("Cũ");
        when(khachThueRepository.findById(1L)).thenReturn(Optional.of(hienTai));
        when(khachThueRepository.save(any(KhachThue.class))).thenAnswer(inv -> inv.getArgument(0));

        KhachThue body = new KhachThue();
        body.setHoTen("Mới");
        mockMvc.perform(put("/api/khach-thue/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hoTen").value("Mới"));
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layDanhSach_tenantChiThayMinh() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setId(10L);
        nd.setVaiTro(VaiTro.TENANT);
        KhachThue kt = new KhachThue();
        kt.setId(99L);
        kt.setHoTen("Tôi");
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);
        when(khachThueRepository.findByNguoiDung_Id(10L)).thenReturn(kt);

        mockMvc.perform(get("/api/khach-thue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].hoTen").value("Tôi"));
    }
}
