package com.motelmanagement.repository;

import com.motelmanagement.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
    List<Tenant> findByFullNameContainingIgnoreCase(String keyword);

    Tenant findByUserId(Long userId);

    /** Khách thuê chưa gắn tài khoản (để chọn khi tạo tài khoản TENANT). */
    List<Tenant> findByUserIsNull();
}
