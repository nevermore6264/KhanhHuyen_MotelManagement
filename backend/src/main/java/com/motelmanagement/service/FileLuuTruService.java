package com.motelmanagement.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileLuuTruService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final long MAX_SIZE = 5 * 1024 * 1024;
    private static final long MAX_CHAT_SIZE = 10 * 1024 * 1024;
    private static final String[] ALLOWED_CONTENT_TYPES = {
            "image/jpeg", "image/png", "image/gif", "image/webp"
    };
    private static final String[] ALLOWED_CHAT_TYPES = {
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "application/zip"
    };

    public String luuAnh(MultipartFile file, String thuMucCon) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String loaiNoiDung = file.getContentType();
        if (loaiNoiDung == null || !laAnhChoPhep(loaiNoiDung)) {
            throw new IllegalArgumentException("Chỉ chấp nhận ảnh: JPG, PNG, GIF, WEBP");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("Kích thước file tối đa 5MB");
        }
        String thuMuc = thuMucCon != null && !thuMucCon.isBlank() ? thuMucCon.trim() : "misc";
        Path thuMucGoc = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path thuMucDich = thuMucGoc.resolve(thuMuc);
        String duoi = layDuoiFile(loaiNoiDung);
        String tenFile = UUID.randomUUID() + duoi;
        Path dich = thuMucDich.resolve(tenFile);
        try {
            Files.createDirectories(thuMucDich);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, dich, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Không ghi được file ảnh", e);
        }
        return "/tenant-files/" + thuMuc + "/" + tenFile;
    }

    public record KetQuaLuuFile(String duongDan, String tenGoc, long kichThuoc, String loaiNoiDung) {}

    public KetQuaLuuFile luuFileChat(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không hợp lệ.");
        }
        String loaiNoiDung = file.getContentType();
        if (loaiNoiDung == null || !laChatChoPhep(loaiNoiDung)) {
            throw new IllegalArgumentException(
                    "Chỉ chấp nhận ảnh (JPG, PNG, GIF, WEBP) hoặc file PDF, Word, Excel, TXT, ZIP.");
        }
        if (file.getSize() > MAX_CHAT_SIZE) {
            throw new IllegalArgumentException("Kích thước file tối đa 10MB.");
        }
        String thuMuc = "chat";
        Path thuMucGoc = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path thuMucDich = thuMucGoc.resolve(thuMuc);
        String duoi = layDuoiFileChat(loaiNoiDung, file.getOriginalFilename());
        String tenFile = UUID.randomUUID() + duoi;
        Path dich = thuMucDich.resolve(tenFile);
        try {
            Files.createDirectories(thuMucDich);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, dich, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Không ghi được file", e);
        }
        String tenGoc = file.getOriginalFilename() != null ? file.getOriginalFilename() : tenFile;
        return new KetQuaLuuFile(
                "/tenant-files/" + thuMuc + "/" + tenFile,
                tenGoc,
                file.getSize(),
                loaiNoiDung);
    }

    private static boolean laChatChoPhep(String loaiNoiDung) {
        for (String choPhep : ALLOWED_CHAT_TYPES) {
            if (choPhep.equals(loaiNoiDung)) {
                return true;
            }
        }
        return false;
    }

    private static String layDuoiFileChat(String loaiNoiDung, String tenGoc) {
        if (tenGoc != null && tenGoc.contains(".")) {
            String ext = tenGoc.substring(tenGoc.lastIndexOf('.')).toLowerCase();
            if (ext.length() <= 8) {
                return ext;
            }
        }
        return layDuoiFile(loaiNoiDung);
    }

    private static boolean laAnhChoPhep(String loaiNoiDung) {
        for (String choPhep : ALLOWED_CONTENT_TYPES) {
            if (choPhep.equals(loaiNoiDung)) {
                return true;
            }
        }
        return false;
    }

    private static String layDuoiFile(String loaiNoiDung) {
        if (loaiNoiDung == null) {
            return ".jpg";
        }
        return switch (loaiNoiDung) {
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
