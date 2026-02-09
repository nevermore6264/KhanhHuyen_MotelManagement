package com.motelmanagement.repository;

import com.motelmanagement.domain.ServicePrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ServicePriceRepository extends JpaRepository<ServicePrice, Long> {
    Optional<ServicePrice> findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(LocalDate date);
}
