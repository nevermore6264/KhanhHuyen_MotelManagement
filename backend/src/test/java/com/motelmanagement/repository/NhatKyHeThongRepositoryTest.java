package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class NhatKyHeThongRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(NhatKyHeThongRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(NhatKyHeThongRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.NhatKyHeThongRepository", NhatKyHeThongRepository.class.getName());
    }
}
