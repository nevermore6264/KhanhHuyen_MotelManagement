package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class YeuCauHoTroRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(YeuCauHoTroRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(YeuCauHoTroRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.YeuCauHoTroRepository", YeuCauHoTroRepository.class.getName());
    }
}
