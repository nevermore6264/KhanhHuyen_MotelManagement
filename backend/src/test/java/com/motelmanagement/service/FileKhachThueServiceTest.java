package com.motelmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

class FileKhachThueServiceTest {

    private final FileKhachThueService fileKhachThueService = new FileKhachThueService();

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileKhachThueService, "uploadDir", tempDir.toString());
    }

    @Test
    void luuAnh_null_traNull() {
        assertNull(fileKhachThueService.luuAnh(null));
    }

    @Test
    void luuAnh_rong_traNull() {
        MockMultipartFile empty = new MockMultipartFile("f", "a.jpg", "image/jpeg", new byte[0]);
        assertNull(fileKhachThueService.luuAnh(empty));
    }

    @Test
    void luuAnh_loaiKhongHopLe() {
        MockMultipartFile bad = new MockMultipartFile("f", "x.txt", "text/plain", "x".getBytes());
        assertThrows(IllegalArgumentException.class, () -> fileKhachThueService.luuAnh(bad));
    }

    @Test
    void luuAnh_vuot5MB() {
        byte[] big = new byte[5 * 1024 * 1024 + 1];
        MockMultipartFile f = new MockMultipartFile("f", "a.jpg", "image/jpeg", big);
        assertThrows(IllegalArgumentException.class, () -> fileKhachThueService.luuAnh(f));
    }

    @Test
    void luuAnh_jpeg_ghiFileVaTraUrl() throws Exception {
        byte[] data = new byte[] { 1, 2, 3, 4 };
        MockMultipartFile f = new MockMultipartFile("f", "a.jpg", "image/jpeg", data);
        String url = fileKhachThueService.luuAnh(f);
        assertNotNull(url);
        assertTrue(url.startsWith("/tenant-files/tenants/"));
        String tenFile = url.substring("/tenant-files/tenants/".length());
        Path saved = tempDir.resolve("tenants").resolve(tenFile);
        assertTrue(Files.exists(saved));
        assertEquals(data.length, Files.size(saved));
    }
}
