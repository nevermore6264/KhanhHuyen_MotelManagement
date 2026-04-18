package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class TrangThaiPhongTest {

    @Test
    void enumCoGiaTri() {
        assertTrue(TrangThaiPhong.values().length > 0);
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.TrangThaiPhong", TrangThaiPhong.class.getName());
    }
}
