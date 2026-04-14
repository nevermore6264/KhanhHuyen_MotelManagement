package com.motelmanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/** Dịch vụ lưu/đọc file ảnh khách thuê (chân dung, CCCD). */
@Service
public class FileKhachThueService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final String TENANTS_SUBDIR = "tenants";
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_CONTENT_TYPES = {
            "image/jpeg", "image/png", "image/gif", "image/webp"
    };

    /** Lưu file ảnh vào resources/static/tenant-files/tenants và trả về URL tương đối để FE truy cập. */
    public String luuAnh(MultipartFile file) throws IOException {
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
        Path thuMucGoc = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path thuMucKhach = thuMucGoc.resolve(TENANTS_SUBDIR);
        Files.createDirectories(thuMucKhach);
        String duoi = layDuoiFile(loaiNoiDung);
        String tenFile = UUID.randomUUID().toString() + duoi;
        Path dich = thuMucKhach.resolve(tenFile);
        Files.copy(file.getInputStream(), dich, StandardCopyOption.REPLACE_EXISTING);
        return "/tenant-files/" + TENANTS_SUBDIR + "/" + tenFile;
    }

    private static boolean laAnhChoPhep(String loaiNoiDung) {
        for (String choPhep : ALLOWED_CONTENT_TYPES) {
            if (choPhep.equals(loaiNoiDung)) return true;
        }
        return false;
    }

    private static String layDuoiFile(String loaiNoiDung) {
        if (loaiNoiDung == null) return ".jpg";
        switch (loaiNoiDung) {
            case "image/png":
                return ".png";
            case "image/gif":
                return ".gif";
            case "image/webp":
                return ".webp";
            default:
                return ".jpg";
        }
    }
}
