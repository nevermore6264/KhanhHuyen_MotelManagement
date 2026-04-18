package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class PhieuDatLaiMatKhauRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(PhieuDatLaiMatKhauRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(PhieuDatLaiMatKhauRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.PhieuDatLaiMatKhauRepository", PhieuDatLaiMatKhauRepository.class.getName());
    }
}
