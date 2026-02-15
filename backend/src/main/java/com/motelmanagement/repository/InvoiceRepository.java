package com.motelmanagement.repository;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByRoomIdAndMonthAndYear(Long roomId, int month, int year);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "tenant", "room" })
    @Query("select i from Invoice i")
    List<Invoice> findAllWithTenantAndRoom();

    List<Invoice> findByTenant(Tenant tenant);

    List<Invoice> findByStatus(InvoiceStatus status);

    @Query("select sum(i.total) from Invoice i where i.status = 'PAID' and i.month = ?1 and i.year = ?2")
    Double sumRevenueByMonth(int month, int year);
}
