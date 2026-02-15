package com.motelmanagement.controller;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.RoomStatus;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {
    private final InvoiceRepository invoiceRepository;
    private final RoomRepository roomRepository;

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> revenue(@RequestParam(value = "month") int month, @RequestParam(value = "year") int year) {
        Double revenue = invoiceRepository.sumRevenueByMonth(month, year);
        Map<String, Object> result = new HashMap<>();
        result.put("month", month);
        result.put("year", year);
        result.put("revenue", revenue == null ? 0 : revenue);
        return result;
    }

    @GetMapping("/vacant")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> vacantRooms() {
        long count = roomRepository.findByStatus(RoomStatus.AVAILABLE).size();
        Map<String, Object> result = new HashMap<>();
        result.put("vacantRooms", count);
        return result;
    }

    @GetMapping("/debt")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> debt() {
        BigDecimal totalDebt = invoiceRepository.findByStatus(InvoiceStatus.UNPAID).stream()
                .map(Invoice::getTotal)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> result = new HashMap<>();
        result.put("totalDebt", totalDebt);
        return result;
    }
}
