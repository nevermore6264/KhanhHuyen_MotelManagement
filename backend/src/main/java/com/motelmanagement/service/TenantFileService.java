package com.motelmanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class TenantFileService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final String TENANTS_SUBDIR = "tenants";
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_CONTENT_TYPES = {
            "image/jpeg", "image/png", "image/gif", "image/webp"
    };

    /**
     * Lưu file ảnh vào thư mục uploads/tenants/, trả về đường dẫn tương đối (vd: tenants/uuid.jpg).
     * Trả về null nếu file null hoặc rỗng.
     */
    public String saveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedImage(contentType)) {
            throw new IllegalArgumentException("Chỉ chấp nhận ảnh: JPG, PNG, GIF, WEBP");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("Kích thước file tối đa 5MB");
        }
        Path base = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path tenantsDir = base.resolve(TENANTS_SUBDIR);
        Files.createDirectories(tenantsDir);
        String ext = getExtension(contentType);
        String filename = UUID.randomUUID().toString() + ext;
        Path target = tenantsDir.resolve(filename);
        Files.copy(file.getInputStream(), target);
        return TENANTS_SUBDIR + "/" + filename;
    }

    private static boolean isAllowedImage(String contentType) {
        for (String allowed : ALLOWED_CONTENT_TYPES) {
            if (allowed.equals(contentType)) return true;
        }
        return false;
    }

    private static String getExtension(String contentType) {
        if (contentType == null) return ".jpg";
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
