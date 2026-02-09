package com.motelmanagement.repository;

import com.motelmanagement.domain.Contract;
import com.motelmanagement.domain.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByStatus(ContractStatus status);

    List<Contract> findByTenantId(Long tenantId);
}
