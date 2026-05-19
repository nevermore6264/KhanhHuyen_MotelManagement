package com.motelmanagement.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.repository.HoaDonRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class XuatBaoCaoService {
    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final HoaDonRepository hoaDonRepository;
    private final TinhTienService tinhTienService;

    public byte[] xuatExcelCongNo() throws IOException {
        List<HoaDon> chuaThanhToan = hoaDonRepository.findByTrangThaiWithRoomAndTenant(TrangThaiHoaDon.UNPAID)
                .stream()
                .map(tinhTienService::tinhTienRuntime)
                .toList();

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Cong no");
            Row tieuDe = sheet.createRow(0);
            tieuDe.createCell(0).setCellValue("Bao cao cong no - iTro");
            tieuDe.createCell(1).setCellValue("Xuat luc: " + DTF.format(LocalDateTime.now()));

            Row header = sheet.createRow(2);
            String[] cot = {"Ma hoa don", "Phong", "Khach thue", "Thang", "Nam", "Tong tien (VND)", "Trang thai"};
            for (int i = 0; i < cot.length; i++) {
                header.createCell(i).setCellValue(cot[i]);
            }

            int hang = 3;
            BigDecimal tong = BigDecimal.ZERO;
            for (HoaDon hd : chuaThanhToan) {
                Row row = sheet.createRow(hang++);
                row.createCell(0).setCellValue(hd.getId());
                row.createCell(1).setCellValue(hd.getPhong() != null ? hd.getPhong().getMaPhong() : "");
                row.createCell(2).setCellValue(hd.getKhachThue() != null ? hd.getKhachThue().getHoTen() : "");
                row.createCell(3).setCellValue(hd.getThang());
                row.createCell(4).setCellValue(hd.getNam());
                BigDecimal soTien = hd.getTongTien() != null ? hd.getTongTien() : BigDecimal.ZERO;
                row.createCell(5).setCellValue(soTien.doubleValue());
                row.createCell(6).setCellValue(hd.getTrangThai() != null ? hd.getTrangThai().name() : "");
                tong = tong.add(soTien);
            }

            Row tongRow = sheet.createRow(hang + 1);
            tongRow.createCell(4).setCellValue("Tong cong:");
            tongRow.createCell(5).setCellValue(tong.doubleValue());
            tongRow.createCell(6).setCellValue(chuaThanhToan.size() + " hoa don");

            for (int i = 0; i < cot.length; i++) {
                sheet.autoSizeColumn(i);
            }

            wb.write(out);
            return out.toByteArray();
        }
    }

    public BigDecimal tongCongNo() {
        return hoaDonRepository.findByTrangThaiWithRoomAndTenant(TrangThaiHoaDon.UNPAID).stream()
                .map(tinhTienService::tinhTienRuntime)
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
