package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class TrangThaiHoaDonTest {

    @Test
    void enumCoGiaTri() {
        assertTrue(TrangThaiHoaDon.values().length > 0);
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.TrangThaiHoaDon", TrangThaiHoaDon.class.getName());
    }
}
