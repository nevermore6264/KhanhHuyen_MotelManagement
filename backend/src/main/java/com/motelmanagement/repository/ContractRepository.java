package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.Contract;
import com.motelmanagement.domain.ContractStatus;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByStatus(ContractStatus status);

    List<Contract> findByTenantId(Long tenantId);

    long countByRoom_Area_IdAndStatus(Long areaId, ContractStatus status);
}
