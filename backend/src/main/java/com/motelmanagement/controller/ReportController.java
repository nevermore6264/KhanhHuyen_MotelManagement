package com.motelmanagement.controller;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.Room;
import com.motelmanagement.domain.RoomStatus;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {
    private final InvoiceRepository invoiceRepository;
    private final RoomRepository roomRepository;

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> revenue(@RequestParam("month") int month, @RequestParam("year") int year) {
        Double revenue = invoiceRepository.sumRevenueByMonth(month, year);
        Map<String, Object> result = new HashMap<>();
        result.put("month", month);
        result.put("year", year);
        result.put("revenue", revenue == null ? 0 : revenue);
        return result;
    }

    @GetMapping("/revenue-year")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> revenueByYear(@RequestParam("year") int year) {
        List<Object[]> rows = invoiceRepository.sumRevenueByMonthForYear(year);
        Map<Integer, Double> byMonth = new HashMap<>();
        for (int m = 1; m <= 12; m++) {
            byMonth.put(m, 0.0);
        }
        for (Object[] row : rows) {
            Integer month = ((Number) row[0]).intValue();
            double sum = 0.0;
            if (row[1] != null) {
                sum = row[1] instanceof BigDecimal ? ((BigDecimal) row[1]).doubleValue() : ((Number) row[1]).doubleValue();
            }
            byMonth.put(month, sum);
        }
        List<Map<String, Object>> months = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", m);
            entry.put("revenue", byMonth.get(m));
            months.add(entry);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("months", months);
        result.put("total", months.stream().mapToDouble(m -> ((Number) m.get("revenue")).doubleValue()).sum());
        return result;
    }

    @GetMapping("/vacant")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> vacantRooms() {
        List<Room> rooms = roomRepository.findByStatus(RoomStatus.AVAILABLE);
        List<Map<String, Object>> list = rooms.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("code", r.getCode());
            m.put("areaName", r.getArea() != null ? r.getArea().getName() : null);
            m.put("currentPrice", r.getCurrentPrice());
            return m;
        }).collect(Collectors.toList());
        Map<String, Object> result = new HashMap<>();
        result.put("vacantRooms", rooms.size());
        result.put("rooms", list);
        return result;
    }

    @GetMapping("/debt")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> debt() {
        List<Invoice> unpaid = invoiceRepository.findByStatus(InvoiceStatus.UNPAID);
        BigDecimal totalDebt = unpaid.stream()
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> result = new HashMap<>();
        result.put("totalDebt", totalDebt);
        result.put("count", unpaid.size());
        return result;
    }

    @GetMapping("/debt-detail")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> debtDetail() {
        List<Invoice> unpaid = invoiceRepository.findByStatusWithRoomAndTenant(InvoiceStatus.UNPAID);
        List<Map<String, Object>> list = unpaid.stream().map(i -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", i.getId());
            m.put("roomCode", i.getRoom() != null ? i.getRoom().getCode() : null);
            m.put("tenantName", i.getTenant() != null ? i.getTenant().getFullName() : null);
            m.put("month", i.getMonth());
            m.put("year", i.getYear());
            m.put("total", i.getTotal());
            m.put("status", i.getStatus() != null ? i.getStatus().name() : null);
            return m;
        }).collect(Collectors.toList());
        BigDecimal totalDebt = unpaid.stream()
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> result = new HashMap<>();
        result.put("totalDebt", totalDebt);
        result.put("count", unpaid.size());
        result.put("invoices", list);
        return result;
    }

    @GetMapping("/occupancy")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> occupancy() {
        List<Room> all = roomRepository.findAll();
        long total = all.size();
        long available = roomRepository.findByStatus(RoomStatus.AVAILABLE).size();
        long occupied = roomRepository.findByStatus(RoomStatus.OCCUPIED).size();
        long maintenance = roomRepository.findByStatus(RoomStatus.MAINTENANCE).size();
        double rate = total > 0 ? (occupied * 100.0 / total) : 0;
        Map<String, Object> result = new HashMap<>();
        result.put("totalRooms", total);
        result.put("available", available);
        result.put("occupied", occupied);
        result.put("maintenance", maintenance);
        result.put("occupancyRatePercent", Math.round(rate * 10) / 10.0);
        return result;
    }

    @GetMapping("/invoice-summary")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> invoiceSummary(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        List<Invoice> list = invoiceRepository.findByMonthAndYear(month, year);
        long countPaid = list.stream().filter(i -> i.getStatus() == InvoiceStatus.PAID).count();
        long countUnpaid = list.stream().filter(i -> i.getStatus() == InvoiceStatus.UNPAID).count();
        long countPartial = list.stream().filter(i -> i.getStatus() == InvoiceStatus.PARTIAL).count();
        BigDecimal sumPaid = list.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PAID)
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal sumUnpaid = list.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.UNPAID)
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal sumPartial = list.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PARTIAL)
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal sumTotal = list.stream()
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> result = new HashMap<>();
        result.put("month", month);
        result.put("year", year);
        result.put("countPaid", countPaid);
        result.put("countUnpaid", countUnpaid);
        result.put("countPartial", countPartial);
        result.put("countTotal", list.size());
        result.put("sumPaid", sumPaid);
        result.put("sumUnpaid", sumUnpaid);
        result.put("sumPartial", sumPartial);
        result.put("sumTotal", sumTotal);
        return result;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> summary(
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "year", required = false) Integer year) {
        Map<String, Object> result = new HashMap<>();
        int y = year != null ? year : java.time.Year.now().getValue();
        int m = month != null ? month : java.time.YearMonth.now().getMonthValue();
        Double revenue = invoiceRepository.sumRevenueByMonth(m, y);
        result.put("revenueMonth", revenue != null ? revenue : 0);
        result.put("month", m);
        result.put("year", y);
        long vacant = roomRepository.findByStatus(RoomStatus.AVAILABLE).size();
        result.put("vacantRooms", vacant);
        List<Invoice> unpaid = invoiceRepository.findByStatus(InvoiceStatus.UNPAID);
        BigDecimal totalDebt = unpaid.stream()
                .map(Invoice::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        result.put("totalDebt", totalDebt);
        result.put("unpaidCount", unpaid.size());
        result.put("totalRooms", roomRepository.count());
        result.put("occupiedRooms", roomRepository.findByStatus(RoomStatus.OCCUPIED).size());
        return result;
    }
}
