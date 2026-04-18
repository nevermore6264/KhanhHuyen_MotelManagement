package com.motelmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** Nạp toàn bộ ngữ cảnh Spring với profile test (H2 in-memory). */
@SpringBootTest
@ActiveProfiles("test")
class ChuongTrinhTest {

    @Test
    void contextLoads() {
    }
}
