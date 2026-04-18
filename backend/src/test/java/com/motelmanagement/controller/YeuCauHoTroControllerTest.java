package com.motelmanagement.controller;

import static org.mockito.ArgumentMatchers.any;
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

import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.domain.YeuCauHoTro;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.YeuCauHoTroRepository;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.support.KiemThuPhuongThucBaoMat;

@WebMvcTest(controllers = YeuCauHoTroController.class)
@Import(KiemThuPhuongThucBaoMat.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@SuppressWarnings("unused")
class YeuCauHoTroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private YeuCauHoTroRepository yeuCauHoTroRepository;
    @MockitoBean
    private KhachThueRepository khachThueRepository;
    @MockitoBean
    private NguoiDungHienTaiService nguoiDungHienTaiService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void layDanhSach_admin_traTatCa() throws Exception {
        when(yeuCauHoTroRepository.findAll()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/yeu-cau-ho-tro"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void layDanhSach_tenant_traTheoKhach() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setId(2L);
        nd.setVaiTro(VaiTro.TENANT);
        KhachThue kt = new KhachThue();
        kt.setId(9L);
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);
        when(khachThueRepository.findByNguoiDung_Id(2L)).thenReturn(kt);
        when(yeuCauHoTroRepository.findByKhachThue_IdOrderByNgayTaoDesc(9L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/yeu-cau-ho-tro"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void tao_tra200() throws Exception {
        NguoiDung nd = new NguoiDung();
        nd.setId(3L);
        nd.setHoTen("Khách");
        nd.setVaiTro(VaiTro.TENANT);
        KhachThue kt = new KhachThue();
        kt.setId(11L);
        when(nguoiDungHienTaiService.layNguoiDungHienTai()).thenReturn(nd);
        when(khachThueRepository.findByNguoiDung_Id(3L)).thenReturn(kt);
        when(yeuCauHoTroRepository.save(any(YeuCauHoTro.class))).thenAnswer(inv -> {
            YeuCauHoTro y = inv.getArgument(0);
            y.setId(100L);
            return y;
        });

        mockMvc.perform(post("/api/yeu-cau-ho-tro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tieuDe\":\"Sửa ống nước\",\"moTa\":\"Phòng A\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void capNhat_tra200() throws Exception {
        YeuCauHoTro hienTai = new YeuCauHoTro();
        hienTai.setId(1L);
        hienTai.setTieuDe("Cũ");
        when(yeuCauHoTroRepository.findById(1L)).thenReturn(Optional.of(hienTai));
        when(yeuCauHoTroRepository.save(any(YeuCauHoTro.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/api/yeu-cau-ho-tro/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"trangThai\":\"RESOLVED\",\"tieuDe\":\"Xong\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trangThai").value("RESOLVED"));
    }

    @Test
    @WithMockUser(roles = "TENANT")
    void capNhat_tenant403() throws Exception {
        mockMvc.perform(put("/api/yeu-cau-ho-tro/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"trangThai\":\"RESOLVED\"}"))
                .andExpect(status().isForbidden());
    }
}
