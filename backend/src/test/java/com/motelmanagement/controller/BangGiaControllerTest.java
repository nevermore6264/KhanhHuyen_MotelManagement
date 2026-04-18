package com.motelmanagement.controller;

import static org.mockito.ArgumentMatchers.any;
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

import com.motelmanagement.domain.BangGiaDichVu;
import com.motelmanagement.repository.BangGiaDichVuRepository;
import com.motelmanagement.support.KiemThuPhuongThucBaoMat;

@WebMvcTest(controllers = BangGiaController.class)
@Import(KiemThuPhuongThucBaoMat.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class BangGiaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BangGiaDichVuRepository bangGiaDichVuRepository;

    @Test
    @WithMockUser(roles = "STAFF")
    void layDanhSach_tra200() throws Exception {
        when(bangGiaDichVuRepository.findAll()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/bang-gia-dich-vu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void tao_tra200() throws Exception {
        when(bangGiaDichVuRepository.save(any(BangGiaDichVu.class))).thenAnswer(inv -> {
            BangGiaDichVu b = inv.getArgument(0);
            b.setId(1L);
            return b;
        });
        mockMvc.perform(post("/api/bang-gia-dich-vu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void tao_staff403() throws Exception {
        mockMvc.perform(post("/api/bang-gia-dich-vu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }
}
