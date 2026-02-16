"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(Number(n))) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

type DebtInvoice = {
  id: number;
  roomCode?: string;
  tenantName?: string;
  month: number;
  year: number;
  total?: number;
  status?: string;
};
type VacantRoom = { id: number; code: string; areaName?: string; currentPrice?: number };
type RevenueMonth = { month: number; revenue: number };
type Summary = {
  revenueMonth?: number;
  month?: number;
  year?: number;
  vacantRooms?: number;
  totalDebt?: number;
  unpaidCount?: number;
  totalRooms?: number;
  occupiedRooms?: number;
};
type InvoiceSummary = {
  month: number;
  year: number;
  countPaid: number;
  countUnpaid: number;
  countPartial: number;
  countTotal: number;
  sumPaid?: number;
  sumUnpaid?: number;
  sumPartial?: number;
  sumTotal?: number;
};
type Occupancy = {
  totalRooms: number;
  available: number;
  occupied: number;
  maintenance: number;
  occupancyRatePercent: number;
};

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [yearRevenue, setYearRevenue] = useState(String(now.getFullYear()));
  const [summary, setSummary] = useState<Summary | null>(null);
  const [debtDetail, setDebtDetail] = useState<{ totalDebt?: number; count?: number; invoices?: DebtInvoice[] } | null>(null);
  const [vacantData, setVacantData] = useState<{ vacantRooms?: number; rooms?: VacantRoom[] } | null>(null);
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null);
  const [revenueYear, setRevenueYear] = useState<{ year: number; months: RevenueMonth[]; total?: number } | null>(null);
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const role = getRole();
  const canView = role === "ADMIN" || role === "STAFF";

  const loadAll = async () => {
    if (!canView) return;
    setLoading(true);
    setError("");
    try {
      const m = month ? Number(month) : now.getMonth() + 1;
      const y = year ? Number(year) : now.getFullYear();
      const [sumRes, debtRes, vacantRes, occRes, invSumRes] = await Promise.all([
        api.get(`/reports/summary?month=${m}&year=${y}`),
        api.get("/reports/debt-detail"),
        api.get("/reports/vacant"),
        api.get("/reports/occupancy"),
        api.get(`/reports/invoice-summary?month=${m}&year=${y}`),
      ]);
      setSummary(sumRes.data);
      setDebtDetail(debtRes.data);
      setVacantData(vacantRes.data);
      setOccupancy(occRes.data);
      setInvoiceSummary(invSumRes.data);
    } catch (e) {
      setError("Không tải được báo cáo. Kiểm tra quyền truy cập.");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueYear = async () => {
    if (!canView || !yearRevenue) return;
    try {
      const res = await api.get(`/reports/revenue-year?year=${yearRevenue}`);
      setRevenueYear(res.data);
    } catch {
      setRevenueYear(null);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (yearRevenue && canView) loadRevenueYear();
  }, [yearRevenue]);

  if (!canView) {
    return (
      <ProtectedPage>
        <NavBar />
        <div className="container">
          <h2>Báo cáo</h2>
          <div className="card">
            <p className="form-error">Bạn không có quyền xem báo cáo.</p>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Báo cáo &amp; thống kê</h2>

        <div className="card">
          <div className="grid grid-2">
            <div>
              <h3>Bộ lọc kỳ</h3>
              <p className="card-subtitle">
                Chọn tháng/năm để xem doanh thu và báo cáo hóa đơn theo kỳ.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
              <div>
                <label className="field-label">Tháng</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  placeholder="Tháng"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={{ width: 70 }}
                />
              </div>
              <div>
                <label className="field-label">Năm</label>
                <input
                  type="number"
                  placeholder="Năm"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ width: 80 }}
                />
              </div>
              <button className="btn" onClick={loadAll} disabled={loading}>
                {loading ? "Đang tải..." : "Tải lại"}
              </button>
            </div>
          </div>
          {error && <div className="form-error mt-2">{error}</div>}
        </div>

        {/* Tổng quan */}
        <div className="card">
          <h3>Tổng quan</h3>
          <p className="card-subtitle mb-3">
            Doanh thu tháng chọn, phòng trống, công nợ và tình trạng phòng.
          </p>
          <div className="grid grid-4" style={{ gap: 16 }}>
            <div className="card" style={{ background: "var(--blue-50)", border: "1px solid var(--blue-200)" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Doanh thu tháng {summary?.month}/{summary?.year}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--blue-700)" }}>
                {formatMoney(summary?.revenueMonth)}
              </div>
            </div>
            <div className="card" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Phòng trống</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#166534" }}>
                {summary?.vacantRooms ?? "—"} / {summary?.totalRooms ?? "—"}
              </div>
            </div>
            <div className="card" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Công nợ (chưa thanh toán)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#b91c1c" }}>
                {formatMoney(summary?.totalDebt)}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{summary?.unpaidCount ?? 0} hóa đơn</div>
            </div>
            <div className="card" style={{ background: "#faf5ff", border: "1px solid #e9d5ff" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Tỷ lệ lấp đầy</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#6b21a8" }}>
                {occupancy?.occupancyRatePercent ?? "—"}%
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {occupancy?.occupied ?? "—"} đang thuê / {occupancy?.totalRooms ?? "—"} phòng
              </div>
            </div>
          </div>
        </div>

        {/* Doanh thu theo năm */}
        <div className="card">
          <h3>Doanh thu theo từng tháng trong năm</h3>
          <p className="card-subtitle mb-3">
            Chọn năm để xem doanh thu đã thu (hóa đơn đã thanh toán) từng tháng.
          </p>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
            <div>
              <label className="field-label">Năm</label>
              <input
                type="number"
                value={yearRevenue}
                onChange={(e) => setYearRevenue(e.target.value)}
                style={{ width: 90 }}
              />
            </div>
            <button type="button" className="btn btn-secondary" onClick={loadRevenueYear}>
              Xem
            </button>
          </div>
          {revenueYear && (
            <>
              <p className="text-muted mb-2">
                <strong>Tổng doanh thu năm {revenueYear.year}:</strong> {formatMoney(revenueYear.total)}
              </p>
              <SimpleTable
                data={revenueYear.months || []}
                columns={[
                  {
                    header: "Tháng",
                    render: (r: RevenueMonth) => r.month,
                  },
                  {
                    header: "Doanh thu (đã thu)",
                    render: (r: RevenueMonth) => formatMoney(r.revenue),
                  },
                ]}
              />
            </>
          )}
        </div>

        {/* Chi tiết công nợ */}
        <div className="card">
          <h3>Chi tiết công nợ</h3>
          <p className="card-subtitle mb-3">
            Danh sách hóa đơn chưa thanh toán. Tổng: {formatMoney(debtDetail?.totalDebt)} ({debtDetail?.count ?? 0} hóa đơn).
          </p>
          <SimpleTable
            data={debtDetail?.invoices ?? []}
            columns={[
              { header: "ID", render: (r: DebtInvoice) => r.id },
              { header: "Phòng", render: (r: DebtInvoice) => r.roomCode ?? "—" },
              { header: "Khách thuê", render: (r: DebtInvoice) => r.tenantName ?? "—" },
              { header: "Kỳ", render: (r: DebtInvoice) => `${r.month}/${r.year}` },
              { header: "Số tiền", render: (r: DebtInvoice) => formatMoney(r.total) },
            ]}
          />
        </div>

        {/* Danh sách phòng trống */}
        <div className="card">
          <h3>Phòng trống</h3>
          <p className="card-subtitle mb-3">
            Các phòng đang trống ({vacantData?.vacantRooms ?? 0} phòng).
          </p>
          <SimpleTable
            data={vacantData?.rooms ?? []}
            columns={[
              { header: "Mã phòng", render: (r: VacantRoom) => r.code },
              { header: "Khu vực", render: (r: VacantRoom) => r.areaName ?? "—" },
              { header: "Giá hiện tại", render: (r: VacantRoom) => formatMoney(r.currentPrice) },
            ]}
          />
        </div>

        {/* Tình trạng phòng */}
        <div className="card">
          <h3>Tình trạng phòng</h3>
          <p className="card-subtitle mb-3">
            Thống kê theo trạng thái phòng.
          </p>
          <div className="grid grid-4" style={{ gap: 12 }}>
            <div><strong>Tổng phòng:</strong> {occupancy?.totalRooms ?? "—"}</div>
            <div><strong>Đang trống (Available):</strong> {occupancy?.available ?? "—"}</div>
            <div><strong>Đang thuê (Occupied):</strong> {occupancy?.occupied ?? "—"}</div>
            <div><strong>Bảo trì (Maintenance):</strong> {occupancy?.maintenance ?? "—"}</div>
          </div>
          <p className="mt-2 text-muted">
            Tỷ lệ lấp đầy: <strong>{occupancy?.occupancyRatePercent ?? "—"}%</strong>
          </p>
        </div>

        {/* Báo cáo hóa đơn theo kỳ */}
        <div className="card">
          <h3>Báo cáo hóa đơn theo kỳ (tháng {invoiceSummary?.month}/{invoiceSummary?.year})</h3>
          <p className="card-subtitle mb-3">
            Số lượng và tổng tiền theo trạng thái thanh toán.
          </p>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <div>
              <h4 style={{ marginBottom: 8, fontSize: 14 }}>Số lượng hóa đơn</h4>
              <table className="table">
                <tbody>
                  <tr><td>Đã thanh toán</td><td><strong>{invoiceSummary?.countPaid ?? "—"}</strong></td></tr>
                  <tr><td>Chưa thanh toán</td><td><strong>{invoiceSummary?.countUnpaid ?? "—"}</strong></td></tr>
                  <tr><td>Thanh toán một phần</td><td><strong>{invoiceSummary?.countPartial ?? "—"}</strong></td></tr>
                  <tr><td>Tổng</td><td><strong>{invoiceSummary?.countTotal ?? "—"}</strong></td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 style={{ marginBottom: 8, fontSize: 14 }}>Tổng tiền theo trạng thái</h4>
              <table className="table">
                <tbody>
                  <tr><td>Đã thanh toán</td><td><strong>{formatMoney(invoiceSummary?.sumPaid)}</strong></td></tr>
                  <tr><td>Chưa thanh toán</td><td><strong>{formatMoney(invoiceSummary?.sumUnpaid)}</strong></td></tr>
                  <tr><td>Thanh toán một phần</td><td><strong>{formatMoney(invoiceSummary?.sumPartial)}</strong></td></tr>
                  <tr><td>Tổng tiền các hóa đơn</td><td><strong>{formatMoney(invoiceSummary?.sumTotal)}</strong></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
