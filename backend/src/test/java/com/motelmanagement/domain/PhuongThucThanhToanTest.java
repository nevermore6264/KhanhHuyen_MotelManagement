package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class PhuongThucThanhToanTest {

    @Test
    void enumCoGiaTri() {
        assertTrue(PhuongThucThanhToan.values().length > 0);
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.PhuongThucThanhToan", PhuongThucThanhToan.class.getName());
    }
}
