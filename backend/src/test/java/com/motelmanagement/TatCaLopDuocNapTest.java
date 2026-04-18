package com.motelmanagement;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

/**
 * Đảm bảo mọi lớp nguồn {@code com.motelmanagement.**} được liệt kê trong {@code danh-sach-lop.txt}
 * có thể nạp bởi classloader (sinh từ mã nguồn; cập nhật file khi thêm/xóa lớp).
 */
class TatCaLopDuocNapTest {

    @TestFactory
    Stream<DynamicTest> moiLopTrongDanhSachCoTheForName() throws Exception {
        List<String> tenLop = new ArrayList<>();
        try (InputStream in = Objects.requireNonNull(getClass().getResourceAsStream("/danh-sach-lop.txt"),
                        "Thieu tep classpath:/danh-sach-lop.txt");
                BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            String dong;
            while ((dong = reader.readLine()) != null) {
                dong = dong.trim();
                if (!dong.isEmpty() && !dong.startsWith("#")) {
                    tenLop.add(dong);
                }
            }
        }
        return tenLop.stream().map(ten -> DynamicTest.dynamicTest(ten, () -> assertDoesNotThrow(() -> Class.forName(ten))));
    }
}
