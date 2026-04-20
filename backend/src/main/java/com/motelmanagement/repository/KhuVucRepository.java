package com.motelmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.KhuVuc;

/** Repository khu vực. */
public interface KhuVucRepository extends JpaRepository<KhuVuc, String> {
}
