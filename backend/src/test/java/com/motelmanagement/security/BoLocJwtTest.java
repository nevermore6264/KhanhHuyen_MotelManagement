package com.motelmanagement.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class BoLocJwtTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.security.BoLocJwt", BoLocJwt.class.getName());
    }
}
