package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.PayOSOrder;

public interface PayOSOrderRepository extends JpaRepository<PayOSOrder, Long> {
    Optional<PayOSOrder> findByOrderCode(long orderCode);
}
