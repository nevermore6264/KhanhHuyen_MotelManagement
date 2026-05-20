package com.motelmanagement.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.HoaDonChiTiet;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.PhuongThucThanhToan;
import com.motelmanagement.domain.ThanhToan;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.domain.VaiTro;
import com.motelmanagement.repository.HoaDonChiTietRepository;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.ThanhToanRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class XuatPdfService {
    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final KhachThueRepository khachThueRepository;
    private final TinhTienService tinhTienService;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    public byte[] pdfBaoCaoThuChi(LocalDate tuNgay, LocalDate denNgay) {
        LocalDateTime tu = tuNgay.atStartOfDay();
        LocalDateTime den = denNgay.plusDays(1).atStartOfDay();
        List<ThanhToan> danhSach = thanhToanRepository.findTrongKhoangThoiGian(tu, den);
        BigDecimal tong = BigDecimal.ZERO;
        StringBuilder rows = new StringBuilder();
        for (ThanhToan tt : danhSach) {
            BigDecimal soTien = tt.getSoTien() != null ? tt.getSoTien() : BigDecimal.ZERO;
            tong = tong.add(soTien);
            String phong = tt.getHoaDon() != null && tt.getHoaDon().getPhong() != null
                    ? tt.getHoaDon().getPhong().getMaPhong()
                    : "";
            String khach = tt.getHoaDon() != null && tt.getHoaDon().getKhachThue() != null
                    ? tt.getHoaDon().getKhachThue().getHoTen()
                    : "";
            rows.append("<tr><td>").append(tt.getThoiGianThanhToan() != null ? DTF.format(tt.getThoiGianThanhToan()) : "")
                    .append("</td><td>").append(escape(phong))
                    .append("</td><td>").append(escape(khach))
                    .append("</td><td class='r'>").append(formatTien(soTien))
                    .append("</td><td>").append(escape(labelPhuongThuc(tt.getPhuongThuc())))
                    .append("</td></tr>");
        }
        String html = """
                <html><head><meta charset="UTF-8"/><style>
                body{font-family:sans-serif;font-size:12px;}
                h1{font-size:16px;} table{width:100%%;border-collapse:collapse;}
                th,td{border:1px solid #ccc;padding:6px;} th{background:#eee;}
                .r{text-align:right;} .t{font-weight:bold;margin-top:12px;}
                </style></head><body>
                <h1>Bao cao thu chi iTro</h1>
                <p>Tu %s den %s</p>
                <table><thead><tr><th>Thoi gian</th><th>Phong</th><th>Khach</th><th>So tien</th><th>Hinh thuc</th></tr></thead>
                <tbody>%s</tbody></table>
                <p class="t">Tong thu: %s VND (%d giao dich)</p>
                </body></html>
                """.formatted(tuNgay, denNgay, rows, formatTien(tong), danhSach.size());
        return renderPdf(html);
    }

    public byte[] pdfHoaDon(String maHoaDon) {
        HoaDon hd = hoaDonRepository.timTheoIdCoPhong(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoa don."));
        kiemTraQuyenXemHoaDon(hd);
        hd = tinhTienService.dongBoHoaDonTheoChiSoNeuCo(hd);
        List<HoaDonChiTiet> chiTiet = hoaDonChiTietRepository.findByHoaDon_IdOrderByThuTuAsc(maHoaDon);

        StringBuilder rows = new StringBuilder();
        if (!chiTiet.isEmpty()) {
            for (HoaDonChiTiet ct : chiTiet) {
                rows.append("<tr><td>").append(escape(ct.getTenKhoan()))
                        .append("</td><td class='r'>").append(formatTien(ct.getSoTien()))
                        .append("</td></tr>");
            }
        } else {
            if (hd.getTienPhong() != null && hd.getTienPhong().signum() > 0) {
                rows.append(rowKhoan("Tien phong", hd.getTienPhong()));
            }
            if (hd.getTienDien() != null && hd.getTienDien().signum() > 0) {
                rows.append(rowKhoan("Tien dien", hd.getTienDien()));
            }
            if (hd.getTienNuoc() != null && hd.getTienNuoc().signum() > 0) {
                rows.append(rowKhoan("Tien nuoc", hd.getTienNuoc()));
            }
        }

        String html = htmlKhung(
                "HOA DON THUE PHONG",
                bodyHoaDon(hd, rows.toString()));
        return renderPdf(html);
    }

    public byte[] pdfPhieuThu(String maThanhToan) {
        ThanhToan tt = thanhToanRepository.findById(maThanhToan)
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay giao dich thanh toan."));
        if (tt.getHoaDon() == null || tt.getHoaDon().getId() == null) {
            throw new IllegalArgumentException("Giao dich khong gan hoa don.");
        }
        HoaDon hd = hoaDonRepository.timTheoIdCoPhong(tt.getHoaDon().getId())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay hoa don."));
        kiemTraQuyenXemHoaDon(hd);

        String html = htmlKhung(
                "PHIEU THU",
                bodyPhieuThu(tt, hd));
        return renderPdf(html);
    }

    private void kiemTraQuyenXemHoaDon(HoaDon hd) {
        NguoiDung nd = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nd == null) {
            throw new IllegalArgumentException("Chua dang nhap.");
        }
        if (nd.getVaiTro() == VaiTro.ADMIN || nd.getVaiTro() == VaiTro.STAFF) {
            return;
        }
        if (nd.getVaiTro() == VaiTro.TENANT) {
            KhachThue kt = khachThueRepository.findByNguoiDung_Id(nd.getId());
            if (kt != null && hd.getKhachThue() != null && kt.getId().equals(hd.getKhachThue().getId())) {
                return;
            }
            throw new IllegalArgumentException("Ban khong co quyen xem hoa don nay.");
        }
        throw new IllegalArgumentException("Ban khong co quyen xem hoa don nay.");
    }

    private static String bodyHoaDon(HoaDon hd, String chiTietRows) {
        String phong = hd.getPhong() != null ? escape(hd.getPhong().getMaPhong()) : "—";
        String khach = hd.getKhachThue() != null ? escape(hd.getKhachThue().getHoTen()) : "—";
        String trangThai = hd.getTrangThai() != null ? labelTrangThai(hd.getTrangThai()) : "—";
        return """
                <p><strong>Ma hoa don:</strong> %s</p>
                <p><strong>Phong:</strong> %s &nbsp;|&nbsp; <strong>Khach:</strong> %s</p>
                <p><strong>Ky:</strong> Thang %d / %d &nbsp;|&nbsp; <strong>Trang thai:</strong> %s</p>
                <table>
                  <thead><tr><th>Khoan thu</th><th class="r">So tien (VND)</th></tr></thead>
                  <tbody>%s</tbody>
                  <tfoot><tr><td><strong>Tong cong</strong></td><td class="r"><strong>%s</strong></td></tr></tfoot>
                </table>
                """.formatted(
                escape(hd.getId()),
                phong,
                khach,
                hd.getThang(),
                hd.getNam(),
                trangThai,
                chiTietRows,
                formatTien(hd.getTongTien()));
    }

    private static String bodyPhieuThu(ThanhToan tt, HoaDon hd) {
        String phong = hd.getPhong() != null ? escape(hd.getPhong().getMaPhong()) : "—";
        String khach = hd.getKhachThue() != null ? escape(hd.getKhachThue().getHoTen()) : "—";
        String thoiGian = tt.getThoiGianThanhToan() != null
                ? DTF.format(tt.getThoiGianThanhToan())
                : "—";
        return """
                <p><strong>Ma phieu:</strong> %s</p>
                <p><strong>Hoa don:</strong> %s &nbsp;|&nbsp; <strong>Phong:</strong> %s</p>
                <p><strong>Khach thue:</strong> %s &nbsp;|&nbsp; <strong>Ky:</strong> %d/%d</p>
                <table>
                  <tr><td>So tien thu</td><td class="r"><strong>%s VND</strong></td></tr>
                  <tr><td>Hinh thuc</td><td class="r">%s</td></tr>
                  <tr><td>Thoi gian</td><td class="r">%s</td></tr>
                </table>
                <p class="muted">Phieu thu duoc tao tu he thong iTro.</p>
                """.formatted(
                escape(tt.getId()),
                escape(hd.getId()),
                phong,
                khach,
                hd.getThang(),
                hd.getNam(),
                formatTien(tt.getSoTien()),
                labelPhuongThuc(tt.getPhuongThuc()),
                escape(thoiGian));
    }

    private static String htmlKhung(String title, String body) {
        return """
                <!DOCTYPE html><html><head><meta charset="UTF-8"/>
                <style>
                  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; margin: 28px; }
                  h1 { font-size: 18px; margin: 0 0 8px; color: #1e40af; }
                  .muted { color: #64748b; font-size: 11px; }
                  table { width: 100%%; border-collapse: collapse; margin-top: 12px; }
                  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; }
                  th { background: #f1f5f9; text-align: left; }
                  td.r, th.r { text-align: right; }
                  tfoot td { background: #f8fafc; }
                </style></head><body>
                <h1>%s</h1>
                <p class="muted">iTro — Quan ly nha tro</p>
                %s
                </body></html>
                """.formatted(escape(title), body);
    }

    private static String rowKhoan(String ten, BigDecimal soTien) {
        return "<tr><td>" + escape(ten) + "</td><td class='r'>" + formatTien(soTien) + "</td></tr>";
    }

    private static String formatTien(BigDecimal v) {
        if (v == null) {
            return "0";
        }
        return String.format(Locale.forLanguageTag("vi-VN"), "%,.0f", v.doubleValue());
    }

    private static String labelTrangThai(TrangThaiHoaDon tt) {
        return switch (tt) {
            case PAID -> "Da thanh toan";
            case PARTIAL -> "Thanh toan mot phan";
            case UNPAID -> "Chua thanh toan";
        };
    }

    private static String labelPhuongThuc(PhuongThucThanhToan pt) {
        if (pt == null) {
            return "—";
        }
        return switch (pt) {
            case CASH -> "Tien mat";
            case TRANSFER -> "Chuyen khoan";
        };
    }

    private static String escape(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private static byte[] renderPdf(String html) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Khong tao duoc file PDF.", e);
        }
    }
}
