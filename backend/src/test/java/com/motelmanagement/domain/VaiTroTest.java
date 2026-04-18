package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class VaiTroTest {

    @Test
    void enumCoGiaTri() {
        assertTrue(VaiTro.values().length > 0);
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.VaiTro", VaiTro.class.getName());
    }
}
