package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class PhongRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(PhongRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(PhongRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.PhongRepository", PhongRepository.class.getName());
    }
}
