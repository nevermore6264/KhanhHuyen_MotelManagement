package com.motelmanagement.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.motelmanagement.dto.PhanHoiXacThuc;
import com.motelmanagement.dto.YeuCauXacThuc;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import com.motelmanagement.service.XacThucService;

/** Slice MVC: BoLocGhiNhatKyApi (filter) can NhatKyService + NguoiDungHienTaiService — mock de khoi nen full context. */
@WebMvcTest(controllers = XacThucController.class)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class XacThucControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private XacThucService xacThucService;
    @MockitoBean
    private NhatKyService nhatKyService;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;

    @Test
    void dangNhap_tra200() throws Exception {
        when(xacThucService.dangNhap(any(YeuCauXacThuc.class)))
                .thenReturn(new PhanHoiXacThuc("tok", "ADMIN", "Admin"));

        YeuCauXacThuc body = new YeuCauXacThuc();
        body.setTenDangNhap("admin");
        body.setMatKhau("x");

        mockMvc.perform(post("/api/xac-thuc/dang-nhap")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("tok"))
                .andExpect(jsonPath("$.vaiTro").value("ADMIN"));
    }
}
