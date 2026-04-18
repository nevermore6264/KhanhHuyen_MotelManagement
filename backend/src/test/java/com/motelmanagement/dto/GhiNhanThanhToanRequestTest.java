package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class GhiNhanThanhToanRequestTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.GhiNhanThanhToanRequest", GhiNhanThanhToanRequest.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = GhiNhanThanhToanRequest.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
