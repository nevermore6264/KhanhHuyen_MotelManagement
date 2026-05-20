package com.motelmanagement.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.motelmanagement.domain.HoiThoai;
import com.motelmanagement.domain.LoaiTinNhan;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.PhanHoiTinNhan;
import com.motelmanagement.domain.TinNhan;
import com.motelmanagement.domain.ThanhVienHoiThoai;
import com.motelmanagement.dto.DtoPhanHoiTinNhan;
import com.motelmanagement.dto.DtoTinNhanChat;
import com.motelmanagement.dto.YeuCauGuiTinChat;
import com.motelmanagement.repository.PhanHoiTinNhanRepository;
import com.motelmanagement.repository.ThanhVienHoiThoaiRepository;
import com.motelmanagement.repository.TinNhanRepository;
import com.motelmanagement.service.FileLuuTruService.KetQuaLuuFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TinNhanChatService {
    private final TinNhanRepository tinNhanRepository;
    private final PhanHoiTinNhanRepository phanHoiRepository;
    private final ThanhVienHoiThoaiRepository thanhVienRepository;
    private final HoiThoaiService hoiThoaiService;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final FileLuuTruService fileLuuTruService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<DtoTinNhanChat> layTinTrongHoiThoai(String hoiThoaiId) {
        hoiThoaiService.kiemTraThanhVien(hoiThoaiId);
        NguoiDung toi = yeuCauDangNhap();
        List<TinNhan> tinNhan = tinNhanRepository.findByHoiThoaiId(hoiThoaiId);
        List<String> ids = tinNhan.stream().map(TinNhan::getId).toList();
        Map<String, List<PhanHoiTinNhan>> phanHoiMap = ids.isEmpty()
                ? Map.of()
                : phanHoiRepository.findByTinNhanIdIn(ids).stream()
                        .collect(Collectors.groupingBy(p -> p.getTinNhan().getId()));
        return tinNhan.stream()
                .map(t -> sangDto(t, toi.getId(), phanHoiMap.getOrDefault(t.getId(), List.of())))
                .toList();
    }

    @Transactional
    public DtoTinNhanChat guiVanBan(String hoiThoaiId, YeuCauGuiTinChat yeuCau) {
        hoiThoaiService.kiemTraThanhVien(hoiThoaiId);
        String noiDung = yeuCau.getNoiDung() != null ? yeuCau.getNoiDung().trim() : "";
        if (noiDung.isEmpty()) {
            throw new IllegalArgumentException("Nội dung không được để trống.");
        }
        TinNhan tin = taoTin(hoiThoaiId, LoaiTinNhan.TEXT, noiDung, null, null, null, null);
        return luuVaDay(tin);
    }

    @Transactional
    public DtoTinNhanChat guiFile(String hoiThoaiId, MultipartFile file, String chuThich) {
        hoiThoaiService.kiemTraThanhVien(hoiThoaiId);
        KetQuaLuuFile ketQua = fileLuuTruService.luuFileChat(file);
        LoaiTinNhan loai = ketQua.loaiNoiDung().startsWith("image/")
                ? LoaiTinNhan.IMAGE
                : LoaiTinNhan.FILE;
        String noiDung = chuThich != null ? chuThich.trim() : "";
        TinNhan tin = taoTin(
                hoiThoaiId,
                loai,
                noiDung.isEmpty() ? null : noiDung,
                ketQua.duongDan(),
                ketQua.tenGoc(),
                ketQua.kichThuoc(),
                ketQua.loaiNoiDung());
        return luuVaDay(tin);
    }

    @Transactional
    public DtoTinNhanChat togglePhanHoi(String tinNhanId, String emoji) {
        NguoiDung toi = yeuCauDangNhap();
        TinNhan tin = tinNhanRepository.findById(tinNhanId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin nhắn."));
        if (tin.getHoiThoai() == null) {
            throw new IllegalArgumentException("Tin nhắn không thuộc hội thoại.");
        }
        hoiThoaiService.kiemTraThanhVien(tin.getHoiThoai().getId());
        String emojiChuan = emoji.trim();
        if (emojiChuan.isEmpty()) {
            throw new IllegalArgumentException("Emoji không hợp lệ.");
        }
        var co = phanHoiRepository.findByTinNhanIdAndNguoiDungIdAndEmoji(
                tinNhanId, toi.getId(), emojiChuan);
        if (co.isPresent()) {
            phanHoiRepository.delete(co.get());
        } else {
            PhanHoiTinNhan ph = new PhanHoiTinNhan();
            ph.setTinNhan(tin);
            ph.setNguoiDung(toi);
            ph.setEmoji(emojiChuan);
            phanHoiRepository.save(ph);
        }
        List<PhanHoiTinNhan> phanHoi = phanHoiRepository.findByTinNhanIdIn(List.of(tinNhanId));
        DtoTinNhanChat dto = sangDto(tin, toi.getId(), phanHoi);
        dayRealtime(tin.getHoiThoai().getId(), "REACTION", dto);
        return dto;
    }

    @Transactional
    public void danhDauDaDocHoiThoai(String hoiThoaiId) {
        hoiThoaiService.kiemTraThanhVien(hoiThoaiId);
        NguoiDung toi = yeuCauDangNhap();
        List<TinNhan> tinNhan = tinNhanRepository.findByHoiThoaiId(hoiThoaiId);
        for (TinNhan t : tinNhan) {
            if (!t.getNguoiGui().getId().equals(toi.getId()) && !t.isDaDoc()) {
                t.setDaDoc(true);
                tinNhanRepository.save(t);
            }
        }
    }

    private TinNhan taoTin(
            String hoiThoaiId,
            LoaiTinNhan loai,
            String noiDung,
            String duongDan,
            String tenFile,
            Long kichThuoc,
            String loaiNoiDungFile) {
        NguoiDung nguoiGui = yeuCauDangNhap();
        HoiThoai hoiThoai = hoiThoaiService.layHoiThoai(hoiThoaiId);
        TinNhan tin = new TinNhan();
        tin.setHoiThoai(hoiThoai);
        tin.setNguoiGui(nguoiGui);
        tin.setLoai(loai);
        tin.setNoiDung(noiDung);
        tin.setDuongDanFile(duongDan);
        tin.setTenFile(tenFile);
        tin.setKichThuocFile(kichThuoc);
        tin.setLoaiNoiDungFile(loaiNoiDungFile);
        tin.setDaDoc(false);
        return tin;
    }

    private DtoTinNhanChat luuVaDay(TinNhan tin) {
        TinNhan daLuu = tinNhanRepository.save(tin);
        DtoTinNhanChat dto = sangDto(daLuu, daLuu.getNguoiGui().getId(), List.of());
        dayRealtime(daLuu.getHoiThoai().getId(), "MESSAGE", dto);
        return dto;
    }

    private void dayRealtime(String hoiThoaiId, String loaiSuKien, DtoTinNhanChat dto) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("loaiSuKien", loaiSuKien);
        payload.put("hoiThoaiId", hoiThoaiId);
        payload.put("tinNhan", dto);
        List<ThanhVienHoiThoai> thanhVien = thanhVienRepository.findByHoiThoaiId(hoiThoaiId);
        for (ThanhVienHoiThoai tv : thanhVien) {
            messagingTemplate.convertAndSendToUser(
                    tv.getNguoiDung().getTenDangNhap(),
                    "/queue/chat",
                    payload);
        }
    }

    private DtoTinNhanChat sangDto(TinNhan tin, String nguoiDungHienTaiId, List<PhanHoiTinNhan> phanHoi) {
        Map<String, List<PhanHoiTinNhan>> theoEmoji = phanHoi.stream()
                .collect(Collectors.groupingBy(
                        PhanHoiTinNhan::getEmoji,
                        LinkedHashMap::new,
                        Collectors.toList()));
        List<DtoPhanHoiTinNhan> dsPhanHoi = new ArrayList<>();
        for (var entry : theoEmoji.entrySet()) {
            List<String> ids = entry.getValue().stream()
                    .map(p -> p.getNguoiDung().getId())
                    .toList();
            dsPhanHoi.add(DtoPhanHoiTinNhan.builder()
                    .emoji(entry.getKey())
                    .soLuong(ids.size())
                    .nguoiDungIds(ids)
                    .cuaToi(ids.contains(nguoiDungHienTaiId))
                    .build());
        }
        return DtoTinNhanChat.builder()
                .id(tin.getId())
                .hoiThoaiId(tin.getHoiThoai() != null ? tin.getHoiThoai().getId() : null)
                .loai(tin.getLoai())
                .noiDung(tin.getNoiDung())
                .duongDanFile(tin.getDuongDanFile())
                .tenFile(tin.getTenFile())
                .kichThuocFile(tin.getKichThuocFile())
                .loaiNoiDungFile(tin.getLoaiNoiDungFile())
                .daDoc(tin.isDaDoc())
                .thoiGianGui(tin.getThoiGianGui())
                .nguoiGuiId(tin.getNguoiGui().getId())
                .nguoiGuiTen(tin.getNguoiGui().getHoTen())
                .nguoiGuiVaiTro(tin.getNguoiGui().getVaiTro().name())
                .phanHoi(dsPhanHoi)
                .build();
    }

    private NguoiDung yeuCauDangNhap() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            throw new IllegalArgumentException("Chưa đăng nhập.");
        }
        return nguoiDung;
    }
}
