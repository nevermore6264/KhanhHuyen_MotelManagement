package com.motelmanagement.integration;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.motelmanagement.dto.YeuCauXacThuc;

/**
 * Nạp context đầy đủ (H2 + profile test), gọi chuỗi API thật để tăng line coverage (JaCoCo đã loại dto/domain/repository/config/job/logging).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class KiemThuApiDayDuIT {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Đăng nhập admin mặc định (KhoiTaoDuLieu)")
    void dangNhapAdmin() throws Exception {
        YeuCauXacThuc body = new YeuCauXacThuc();
        body.setTenDangNhap("admin");
        body.setMatKhau("admin123");
        mockMvc.perform(post("/api/xac-thuc/dang-nhap")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    @DisplayName("GET quản trị + báo cáo")
    void goiNhomQuanTriVaBaoCao() throws Exception {
        mockMvc.perform(get("/api/bang-gia-dich-vu")).andExpect(status().isOk());
        mockMvc.perform(get("/api/nhat-ky")).andExpect(status().isOk());
        mockMvc.perform(get("/api/phong")).andExpect(status().isOk());
        mockMvc.perform(get("/api/phong/co-hop-dong-active")).andExpect(status().isOk());
        mockMvc.perform(get("/api/phong/con-trong")).andExpect(status().isOk());
        mockMvc.perform(get("/api/khu-vuc")).andExpect(status().isOk());
        mockMvc.perform(get("/api/nguoi-dung")).andExpect(status().isOk());
        mockMvc.perform(get("/api/nguoi-dung/cho-thong-bao")).andExpect(status().isOk());
        mockMvc.perform(get("/api/hop-dong")).andExpect(status().isOk());
        mockMvc.perform(get("/api/khach-thue")).andExpect(status().isOk());
        mockMvc.perform(get("/api/chi-so-dien-nuoc")).andExpect(status().isOk());
        mockMvc.perform(get("/api/hoa-don")).andExpect(status().isOk());
        mockMvc.perform(get("/api/yeu-cau-ho-tro")).andExpect(status().isOk());

        mockMvc.perform(get("/api/bao-cao/doanh-thu").param("month", "4").param("year", "2026"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/bao-cao/doanh-thu-theo-nam").param("year", "2026")).andExpect(status().isOk());
        mockMvc.perform(get("/api/bao-cao/phong-trong")).andExpect(status().isOk());
        mockMvc.perform(get("/api/bao-cao/cong-no")).andExpect(status().isOk());
        mockMvc.perform(get("/api/bao-cao/chi-tiet-cong-no")).andExpect(status().isOk());
        mockMvc.perform(get("/api/bao-cao/ty-le-lap-day")).andExpect(status().isOk());
        mockMvc.perform(get("/api/bao-cao/tom-tat-hoa-don").param("month", "4").param("year", "2026"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/bao-cao/tom-tat")).andExpect(status().isOk());

        mockMvc.perform(get("/api/thanh-toan/hoa-don/HD-TEST")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    @DisplayName("Thông báo + PayOS GET info")
    void thongBaoVaThanhToanWebhookInfo() throws Exception {
        mockMvc.perform(get("/api/thong-bao")).andExpect(status().isOk());
        mockMvc.perform(get("/api/thanh-toan/payos/webhook")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "tenant1", roles = { "TENANT" })
    @DisplayName("API tenant — danh sách rỗng nếu chưa có dữ liệu")
    void thanhToanCuaToiRong() throws Exception {
        mockMvc.perform(get("/api/thanh-toan/cua-toi")).andExpect(status().isOk());
        mockMvc.perform(get("/api/hoa-don/cua-toi")).andExpect(status().isOk());
        mockMvc.perform(get("/api/hop-dong/cua-toi")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("Webhook PayOS — body không hợp lệ")
    void webhookPayOsBodyRong() throws Exception {
        mockMvc.perform(post("/api/thanh-toan/payos/webhook").contentType(APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }
}
