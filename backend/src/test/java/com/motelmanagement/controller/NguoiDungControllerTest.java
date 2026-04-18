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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.dto.YeuCauTaoNguoiDung;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.service.NguoiDungChoThongBaoService;
import com.motelmanagement.support.KiemThuPhuongThucBaoMat;

@WebMvcTest(controllers = NguoiDungController.class)
@Import(KiemThuPhuongThucBaoMat.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class NguoiDungControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private NguoiDungRepository nguoiDungRepository;
    @MockitoBean
    private KhachThueRepository khachThueRepository;
    @MockitoBean
    private PasswordEncoder passwordEncoder;
    @MockitoBean
    private NguoiDungChoThongBaoService nguoiDungChoThongBaoService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void layDanhSach_tra200() throws Exception {
        when(nguoiDungRepository.findAll()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/nguoi-dung"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void layChoThongBao_tra200() throws Exception {
        when(nguoiDungChoThongBaoService.layDanhSach()).thenReturn(List.of());
        mockMvc.perform(get("/api/nguoi-dung/cho-thong-bao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void tao_taiKhoan_tra200() throws Exception {
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(nguoiDungRepository.save(any(NguoiDung.class))).thenAnswer(inv -> {
            NguoiDung n = inv.getArgument(0);
            n.setId(1L);
            return n;
        });

        YeuCauTaoNguoiDung body = new YeuCauTaoNguoiDung();
        body.setTenDangNhap("user1");
        body.setMatKhau("secret");
        body.setHoTen("Tên");
        body.setVaiTro(VaiTro.STAFF);
        body.setKichHoat(true);

        mockMvc.perform(post("/api/nguoi-dung")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenDangNhap").value("user1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void capNhat_khongTimThay_tra404() throws Exception {
        when(nguoiDungRepository.findById(999L)).thenReturn(Optional.empty());

        NguoiDung patch = new NguoiDung();
        patch.setHoTen("X");

        mockMvc.perform(put("/api/nguoi-dung/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patch)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_staff403() throws Exception {
        mockMvc.perform(get("/api/nguoi-dung"))
                .andExpect(status().isForbidden());
    }
}
