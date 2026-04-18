package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class ThongBaoRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(ThongBaoRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(ThongBaoRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.ThongBaoRepository", ThongBaoRepository.class.getName());
    }
}
