package com.motelmanagement.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
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
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.ThongBao;
import com.motelmanagement.dto.NotificationCreateDto;
import com.motelmanagement.repository.ThongBaoRepository;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.ThongBaoService;
import com.motelmanagement.support.KiemThuPhuongThucBaoMat;

@WebMvcTest(controllers = ThongBaoController.class)
@Import(KiemThuPhuongThucBaoMat.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class ThongBaoControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ThongBaoRepository thongBaoRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;
    @MockitoBean
    private ThongBaoService thongBaoService;

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_khongCoNguoiDung_traRong() throws Exception {
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(null);
        mockMvc.perform(get("/api/thong-bao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layDanhSach_coDuLieu() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setId(1L);
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);
        when(thongBaoRepository.findByNguoiDung(nd)).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/thong-bao"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void tao_tinNhanTrong_tra400() throws Exception {
        NotificationCreateDto dto = new NotificationCreateDto();
        dto.setMessage("   ");
        mockMvc.perform(post("/api/thong-bao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void tao_thanhCong() throws Exception {
        NotificationCreateDto dto = new NotificationCreateDto();
        dto.setMessage("Thông báo test");
        dto.setUserId(null);
        mockMvc.perform(post("/api/thong-bao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
        verify(thongBaoService).taoVaDay(eq("Thông báo test"), isNull());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void danhDauDaDoc_tra404() throws Exception {
        when(thongBaoRepository.findById(99L)).thenReturn(Optional.empty());
        mockMvc.perform(put("/api/thong-bao/99/da-doc"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void danhDauDaDoc_tra200() throws Exception {
        ThongBao tb = new ThongBao();
        tb.setId(1L);
        tb.setDaDoc(false);
        when(thongBaoRepository.findById(1L)).thenReturn(Optional.of(tb));
        when(thongBaoRepository.save(any(ThongBao.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/thong-bao/1/da-doc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.daDoc").value(true));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void tao_forbidden() throws Exception {
        NotificationCreateDto dto = new NotificationCreateDto();
        dto.setMessage("x");
        mockMvc.perform(post("/api/thong-bao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }
}
