package com.motelmanagement.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.motelmanagement.domain.HoiThoai;
import com.motelmanagement.domain.LoaiHoiThoai;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.ThanhVienHoiThoai;
import com.motelmanagement.domain.TinNhan;
import com.motelmanagement.dto.DtoHoiThoai;
import com.motelmanagement.repository.HoiThoaiRepository;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.repository.ThanhVienHoiThoaiRepository;
import com.motelmanagement.repository.TinNhanRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HoiThoaiService {
    public static final String MA_NHOM_CHUNG = "CHUNG";

    private final HoiThoaiRepository hoiThoaiRepository;
    private final ThanhVienHoiThoaiRepository thanhVienRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final TinNhanRepository tinNhanRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    @PostConstruct
    @Transactional
    public void khoiTaoNhomChung() {
        HoiThoai nhom = hoiThoaiRepository.findByMaCoDinh(MA_NHOM_CHUNG).orElseGet(() -> {
            HoiThoai h = new HoiThoai();
            h.setLoai(LoaiHoiThoai.GROUP);
            h.setTen("Nhóm chung");
            h.setMaCoDinh(MA_NHOM_CHUNG);
            return hoiThoaiRepository.save(h);
        });
        dongBoThanhVienNhom(nhom);
    }

    @Transactional
    public void dongBoThanhVienNhom(HoiThoai nhom) {
        List<NguoiDung> tatCa = nguoiDungRepository.findAll().stream()
                .filter(NguoiDung::isKichHoat)
                .toList();
        for (NguoiDung nd : tatCa) {
            if (!thanhVienRepository.existsByHoiThoaiIdAndNguoiDungId(nhom.getId(), nd.getId())) {
                ThanhVienHoiThoai tv = new ThanhVienHoiThoai();
                tv.setHoiThoai(nhom);
                tv.setNguoiDung(nd);
                thanhVienRepository.save(tv);
            }
        }
    }

    public List<DtoHoiThoai> layDanhSach() {
        NguoiDung toi = yeuCauDangNhap();
        dongBoThanhVienNhom(layNhomChung());
        List<ThanhVienHoiThoai> ds = thanhVienRepository.findHoiThoaiCuaNguoiDung(toi.getId());
        List<DtoHoiThoai> ketQua = new ArrayList<>();
        for (ThanhVienHoiThoai tv : ds) {
            ketQua.add(sangDto(tv.getHoiThoai(), toi));
        }
        ketQua.sort(Comparator
                .comparing((DtoHoiThoai d) -> d.getLoai() == LoaiHoiThoai.GROUP ? 0 : 1)
                .thenComparing(
                        DtoHoiThoai::getThoiGianTinCuoi,
                        Comparator.nullsLast(Comparator.reverseOrder())));
        return ketQua;
    }

    @Transactional
    public DtoHoiThoai taoHoacLayRieng(String nguoiDungId) {
        NguoiDung toi = yeuCauDangNhap();
        if (nguoiDungId.equals(toi.getId())) {
            throw new IllegalArgumentException("Không thể chat với chính mình.");
        }
        NguoiDung doiTuong = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        if (!doiTuong.isKichHoat()) {
            throw new IllegalArgumentException("Người dùng không hoạt động.");
        }
        Optional<String> hoiThoaiId = thanhVienRepository.timHoiThoaiRieng(
                LoaiHoiThoai.PRIVATE, toi.getId(), doiTuong.getId());
        HoiThoai hoiThoai;
        if (hoiThoaiId.isPresent()) {
            hoiThoai = hoiThoaiRepository.findById(hoiThoaiId.get()).orElseThrow();
        } else {
            hoiThoai = new HoiThoai();
            hoiThoai.setLoai(LoaiHoiThoai.PRIVATE);
            hoiThoai.setTen(null);
            hoiThoai = hoiThoaiRepository.save(hoiThoai);
            themThanhVien(hoiThoai, toi);
            themThanhVien(hoiThoai, doiTuong);
        }
        return sangDto(hoiThoai, toi);
    }

    public HoiThoai layNhomChung() {
        return hoiThoaiRepository.findByMaCoDinh(MA_NHOM_CHUNG)
                .orElseThrow(() -> new IllegalStateException("Chưa khởi tạo nhóm chung."));
    }

    public void kiemTraThanhVien(String hoiThoaiId) {
        NguoiDung toi = yeuCauDangNhap();
        if (!thanhVienRepository.existsByHoiThoaiIdAndNguoiDungId(hoiThoaiId, toi.getId())) {
            throw new IllegalArgumentException("Bạn không thuộc cuộc hội thoại này.");
        }
    }

    public HoiThoai layHoiThoai(String id) {
        return hoiThoaiRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hội thoại."));
    }

    private void themThanhVien(HoiThoai hoiThoai, NguoiDung nguoiDung) {
        ThanhVienHoiThoai tv = new ThanhVienHoiThoai();
        tv.setHoiThoai(hoiThoai);
        tv.setNguoiDung(nguoiDung);
        thanhVienRepository.save(tv);
    }

    private DtoHoiThoai sangDto(HoiThoai h, NguoiDung toi) {
        String tenHienThi = h.getTen();
        String doiTuongId = null;
        String doiTuongTen = null;
        String doiTuongVaiTro = null;
        int soThanhVien = thanhVienRepository.findByHoiThoaiId(h.getId()).size();

        if (h.getLoai() == LoaiHoiThoai.GROUP) {
            tenHienThi = h.getTen() != null ? h.getTen() : "Nhóm chung";
        } else {
            List<ThanhVienHoiThoai> tvs = thanhVienRepository.findByHoiThoaiId(h.getId());
            for (ThanhVienHoiThoai tv : tvs) {
                if (!tv.getNguoiDung().getId().equals(toi.getId())) {
                    doiTuongId = tv.getNguoiDung().getId();
                    doiTuongTen = tv.getNguoiDung().getHoTen();
                    doiTuongVaiTro = tv.getNguoiDung().getVaiTro().name();
                    tenHienThi = doiTuongTen;
                    break;
                }
            }
        }

        Optional<TinNhan> tinCuoi = tinNhanRepository.findFirstByHoiThoaiIdOrderByThoiGianGuiDesc(h.getId());
        String preview = null;
        if (tinCuoi.isPresent()) {
            TinNhan t = tinCuoi.get();
            preview = tomTatTin(t);
        }

        return DtoHoiThoai.builder()
                .id(h.getId())
                .loai(h.getLoai())
                .ten(h.getTen())
                .tenHienThi(tenHienThi)
                .doiTuongId(doiTuongId)
                .doiTuongTen(doiTuongTen)
                .doiTuongVaiTro(doiTuongVaiTro)
                .tinCuoi(preview)
                .thoiGianTinCuoi(tinCuoi.map(TinNhan::getThoiGianGui).orElse(null))
                .soThanhVien(soThanhVien)
                .build();
    }

    private static String tomTatTin(TinNhan t) {
        if (t.getLoai() == com.motelmanagement.domain.LoaiTinNhan.IMAGE) {
            return "📷 Ảnh";
        }
        if (t.getLoai() == com.motelmanagement.domain.LoaiTinNhan.FILE) {
            return "📎 " + (t.getTenFile() != null ? t.getTenFile() : "File");
        }
        String nd = t.getNoiDung();
        if (nd == null) {
            return "";
        }
        return nd.length() > 60 ? nd.substring(0, 60) + "…" : nd;
    }

    private NguoiDung yeuCauDangNhap() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            throw new IllegalArgumentException("Chưa đăng nhập.");
        }
        return nguoiDung;
    }
}
