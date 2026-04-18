package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class TrangThaiHopDongTest {

    @Test
    void enumCoGiaTri() {
        assertTrue(TrangThaiHopDong.values().length > 0);
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.TrangThaiHopDong", TrangThaiHopDong.class.getName());
    }
}
