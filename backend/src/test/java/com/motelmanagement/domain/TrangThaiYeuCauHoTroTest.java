package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class TrangThaiYeuCauHoTroTest {

    @Test
    void enumCoGiaTri() {
        assertTrue(TrangThaiYeuCauHoTro.values().length > 0);
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.TrangThaiYeuCauHoTro", TrangThaiYeuCauHoTro.class.getName());
    }
}
