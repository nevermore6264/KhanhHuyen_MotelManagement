package com.motelmanagement.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.motelmanagement.domain.VaiTro;

class TienIchJwtTest {

    private final TienIchJwt tienIchJwt = new TienIchJwt();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(tienIchJwt, "secret",
                "test_jwt_secret_minimum_64_chars________________________________0123456789abcdef");
        ReflectionTestUtils.setField(tienIchJwt, "expirationMs", 86_400_000L);
    }

    @Test
    void generateVaParseClaims_giuSubjectVaVaiTro() {
        String token = tienIchJwt.generateToken("user1", VaiTro.ADMIN.name());
        assertEquals("user1", tienIchJwt.parseClaims(token).getSubject());
        assertEquals(VaiTro.ADMIN.name(), tienIchJwt.parseClaims(token).get("role", String.class));
    }
}
