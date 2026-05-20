package com.motelmanagement.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TinNhan;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.dto.YeuCauGuiTinNhan;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.repository.TinNhanRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TinNhanService {
    private final TinNhanRepository tinNhanRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final PhongRepository phongRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<TinNhan> layTinNhan() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            throw new IllegalArgumentException("Chưa đăng nhập.");
        }
        if (nguoiDung.getVaiTro() == VaiTro.TENANT) {
            return tinNhanRepository.findHoiThoaiCuaNguoiDung(nguoiDung.getId());
        }
        return tinNhanRepository.findTatCaChoNhanVien();
    }

    @Transactional
    public TinNhan gui(YeuCauGuiTinNhan yeuCau) {
        NguoiDung nguoiGui = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiGui == null) {
            throw new IllegalArgumentException("Chưa đăng nhập.");
        }
        String noiDung = yeuCau.getNoiDung().trim();
        if (noiDung.isEmpty()) {
            throw new IllegalArgumentException("Nội dung không được để trống.");
        }

        NguoiDung nguoiNhan = null;
        if (yeuCau.getNguoiNhanId() != null && !yeuCau.getNguoiNhanId().isBlank()) {
            nguoiNhan = nguoiDungRepository.findById(yeuCau.getNguoiNhanId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người nhận."));
        } else if (nguoiGui.getVaiTro() == VaiTro.TENANT) {
            nguoiNhan = null;
        } else {
            throw new IllegalArgumentException("Vui lòng chọn người nhận.");
        }

        Phong phong = null;
        if (yeuCau.getPhongId() != null && !yeuCau.getPhongId().isBlank()) {
            phong = phongRepository.findById(yeuCau.getPhongId()).orElse(null);
        }

        TinNhan tin = new TinNhan();
        tin.setNguoiGui(nguoiGui);
        tin.setNguoiNhan(nguoiNhan);
        tin.setPhong(phong);
        tin.setLoai(com.motelmanagement.domain.LoaiTinNhan.TEXT);
        tin.setNoiDung(noiDung);
        tin.setDaDoc(false);
        TinNhan daLuu = tinNhanRepository.save(tin);
        dayRealtime(daLuu);
        return daLuu;
    }

    @Transactional
    public void danhDauDaDoc(String maTin) {
        tinNhanRepository.findById(maTin).ifPresent(t -> {
            t.setDaDoc(true);
            tinNhanRepository.save(t);
        });
    }

    private void dayRealtime(TinNhan tin) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", tin.getId());
        payload.put("noiDung", tin.getNoiDung());
        payload.put("thoiGianGui", tin.getThoiGianGui() != null ? tin.getThoiGianGui().toString() : null);
        payload.put("daDoc", tin.isDaDoc());
        if (tin.getNguoiGui() != null) {
            payload.put("nguoiGuiId", tin.getNguoiGui().getId());
            payload.put("nguoiGuiTen", tin.getNguoiGui().getHoTen());
        }
        if (tin.getNguoiNhan() != null) {
            payload.put("nguoiNhanId", tin.getNguoiNhan().getId());
        }
        if (tin.getPhong() != null) {
            payload.put("phongMa", tin.getPhong().getMaPhong());
        }

        if (tin.getNguoiNhan() != null) {
            messagingTemplate.convertAndSendToUser(
                    tin.getNguoiNhan().getTenDangNhap(),
                    "/queue/chat",
                    payload);
        }
        messagingTemplate.convertAndSendToUser(
                tin.getNguoiGui().getTenDangNhap(),
                "/queue/chat",
                payload);

        List<NguoiDung> nhanVien = nguoiDungRepository.findByVaiTroIn(List.of(VaiTro.ADMIN, VaiTro.STAFF));
        for (NguoiDung nv : nhanVien) {
            if (tin.getNguoiNhan() == null && tin.getNguoiGui().getVaiTro() == VaiTro.TENANT) {
                messagingTemplate.convertAndSendToUser(nv.getTenDangNhap(), "/queue/chat", payload);
            }
        }
    }
}
