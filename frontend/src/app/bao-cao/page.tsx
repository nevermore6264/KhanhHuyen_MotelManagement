"use client";

import { useEffect, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import { IconRefresh, IconEye, IconDownload } from "@/components/Icons";
import BangDonGian from "@/components/BangDonGian";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { taiFileTuApi } from "@/lib/taiFile";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { dinhDangTien } from "@/lib/locale";

type DebtInvoice = {
  id: string;
  roomCode?: string;
  tenantName?: string;
  month: number;
  year: number;
  total?: number;
  status?: string;
};
type VacantRoom = {
  id: string;
  code: string;
  areaName?: string;
  currentPrice?: number;
};
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

export default function TrangBaoCao() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [yearRevenue, setYearRevenue] = useState(String(now.getFullYear()));
  const [summary, setSummary] = useState<Summary | null>(null);
  const [debtDetail, setDebtDetail] = useState<{
    totalDebt?: number;
    count?: number;
    invoices?: DebtInvoice[];
  } | null>(null);
  const [vacantData, setVacantData] = useState<{
    vacantRooms?: number;
    rooms?: VacantRoom[];
  } | null>(null);
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null);
  const [revenueYear, setRevenueYear] = useState<{
    year: number;
    months: RevenueMonth[];
    total?: number;
  } | null>(null);
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [exportingDebt, setExportingDebt] = useState(false);
  const [exportingThuChi, setExportingThuChi] = useState(false);
  const [tuNgay, setTuNgay] = useState(
    () =>
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
  );
  const [denNgay, setDenNgay] = useState(
    () => now.toISOString().slice(0, 10),
  );
  const [error, setError] = useState("");
  const { notify } = useToast();
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.baoCao;
  const s = tr.pages.shared;
  const formatMoney = (n?: number | null) =>
    n == null || isNaN(Number(n)) ? "—" : dinhDangTien(Math.round(Number(n)), lang);
  const [mounted, setMounted] = useState(false);
  const role = mounted ? getRole() : null;
  const canView = role === "ADMIN" || role === "STAFF";

  const loadAll = async () => {
    if (!canView) return;
    setLoading(true);
    setError("");
    try {
      const m = month ? Number(month) : now.getMonth() + 1;
      const y = year ? Number(year) : now.getFullYear();
      const [sumRes, debtRes, vacantRes, occRes, invSumRes] = await Promise.all(
        [
          api.get(`/bao-cao/tom-tat?month=${m}&year=${y}`),
          api.get("/bao-cao/chi-tiet-cong-no"),
          api.get("/bao-cao/phong-trong"),
          api.get("/bao-cao/ty-le-lap-day"),
          api.get(`/bao-cao/tom-tat-hoa-don?month=${m}&year=${y}`),
        ],
      );
      setSummary(sumRes.data);
      setDebtDetail(debtRes.data);
      setVacantData(vacantRes.data);
      setOccupancy(occRes.data);
      setInvoiceSummary(invSumRes.data);
    } catch (e) {
      setError(p.errLoad);
    } finally {
      setLoading(false);
    }
  };

  const xuatCongNoExcel = async () => {
    setExportingDebt(true);
    try {
      const ngay = new Date().toISOString().slice(0, 10);
      await taiFileTuApi("/bao-cao/xuat-cong-no", `cong-no-${ngay}.xlsx`);
      notify(p.okDebtExcel, "success");
    } catch {
      notify(p.errExportExcel, "error");
    } finally {
      setExportingDebt(false);
    }
  };

  const xuatThuChi = async (dinhDang: "excel" | "pdf") => {
    if (!tuNgay || !denNgay || denNgay < tuNgay) {
      notify(p.errDateRange, "error");
      return;
    }
    setExportingThuChi(true);
    try {
      const q = `tuNgay=${tuNgay}&denNgay=${denNgay}`;
      if (dinhDang === "excel") {
        await taiFileTuApi(
          `/bao-cao/xuat-thu-chi?${q}`,
          `thu-chi-${tuNgay}_${denNgay}.xlsx`,
        );
      } else {
        await taiFileTuApi(
          `/bao-cao/xuat-thu-chi-pdf?${q}`,
          `thu-chi-${tuNgay}_${denNgay}.pdf`,
        );
      }
      notify(p.okCashflow, "success");
    } catch {
      notify(p.errExport, "error");
    } finally {
      setExportingThuChi(false);
    }
  };

  const loadRevenueYear = async () => {
    if (!canView || !yearRevenue) return;
    try {
      const res = await api.get(
        `/bao-cao/doanh-thu-theo-nam?year=${yearRevenue}`,
      );
      setRevenueYear(res.data);
    } catch {
      setRevenueYear(null);
    }
  };

  useEffect(() => {
    if (mounted && canView) {
      loadAll();
    }
  }, [mounted, canView]);

  useEffect(() => {
    if (mounted && yearRevenue && canView) loadRevenueYear();
  }, [mounted, yearRevenue, canView]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!canView) {
    return (
      <TrangBaoVe>
      <div className="page-shell page-report">
          <h2>{p.title}</h2>
          <div className="card">
            <p className="form-error">{p.noPermission}</p>
          </div>
        </div>
      </TrangBaoVe>
    );
  }

  return (
    <TrangBaoVe>
      <div className="page-shell page-report">
        <header className="page-top">
          <div className="page-top-text">
            <h1 className="page-heading">{p.title}</h1>
            <p className="page-lead">{p.lead}</p>
          </div>
        </header>

        <div className="card">
          <div className="grid grid-2">
            <div>
              <h3>{p.periodFilter}</h3>
              <p className="card-subtitle">{p.periodFilterSub}</p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <label className="field-label">{p.month}</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  placeholder={p.month}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={{ width: 70 }}
                />
              </div>
              <div>
                <label className="field-label">{p.year}</label>
                <input
                  type="number"
                  placeholder={p.year}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ width: 80 }}
                />
              </div>
              <button className="btn" onClick={loadAll} disabled={loading}>
                {loading ? (
                  p.loading
                ) : (
                  <>
                    <IconRefresh /> {p.reload}
                  </>
                )}
              </button>
            </div>
          </div>
          {error && <div className="form-error mt-2">{error}</div>}
        </div>

        <div className="card">
          <h3>{p.overview}</h3>
          <p className="card-subtitle mb-3">{p.overviewSub}</p>
          <div className="grid grid-4" style={{ gap: 16 }}>
            <div
              className="card"
              style={{
                background: "var(--blue-50)",
                border: "1px solid var(--blue-200)",
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                {p.revenueMonth} {summary?.month}/{summary?.year}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--blue-700)",
                }}
              >
                {formatMoney(summary?.revenueMonth)}
              </div>
            </div>
            <div
              className="card"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                {p.vacantRooms}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#166534" }}>
                {summary?.vacantRooms ?? "—"} / {summary?.totalRooms ?? "—"}
              </div>
            </div>
            <div
              className="card"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                {p.debtUnpaid}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#b91c1c" }}>
                {formatMoney(summary?.totalDebt)}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {summary?.unpaidCount ?? 0} {p.invoiceCount}
              </div>
            </div>
            <div
              className="card"
              style={{ background: "#faf5ff", border: "1px solid #e9d5ff" }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                {p.occupancyRate}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#6b21a8" }}>
                {occupancy?.occupancyRatePercent ?? "—"}%
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {occupancy?.occupied ?? "—"} {p.occupiedOf}{" "}
                {occupancy?.totalRooms ?? "—"} {p.roomsUnit}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>{p.revenueByYear}</h3>
          <p className="card-subtitle mb-3">{p.revenueByYearSub}</p>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
              alignItems: "flex-end",
            }}
          >
            <div>
              <label
                className="field-label"
                style={{ display: "block", marginBottom: 6 }}
              >
                {p.year}
              </label>
              <input
                type="number"
                value={yearRevenue}
                onChange={(e) => setYearRevenue(e.target.value)}
                style={{ width: 90, height: 38, boxSizing: "border-box" }}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadRevenueYear}
              style={{ height: 38 }}
            >
              <IconEye /> {p.view}
            </button>
          </div>
          {revenueYear && (
            <>
              <p className="text-muted mb-2">
                <strong>
                  {p.yearRevenueTotal} {revenueYear.year}:
                </strong>{" "}
                {formatMoney(revenueYear.total)}
              </p>
              <BangDonGian
                data={revenueYear.months || []}
                columns={[
                  {
                    header: p.colMonth,
                    render: (r: RevenueMonth) => r.month,
                  },
                  {
                    header: p.colRevenueCollected,
                    render: (r: RevenueMonth) => formatMoney(r.revenue),
                  },
                ]}
              />
            </>
          )}
        </div>

        <div className="card">
          <h3>{p.cashflowExport}</h3>
          <p className="card-subtitle mb-3">{p.cashflowExportSub}</p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "flex-end",
              marginBottom: 12,
            }}
          >
            <div>
              <label className="field-label">{p.fromDate}</label>
              <input
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">{p.toDate}</label>
              <input
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={exportingThuChi}
              onClick={() => void xuatThuChi("excel")}
            >
              <IconDownload />{" "}
              {exportingThuChi ? p.loading : p.exportExcel}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={exportingThuChi}
              onClick={() => void xuatThuChi("pdf")}
            >
              <IconDownload /> {p.exportPdf}
            </button>
          </div>
        </div>

        <div className="card">
          <h3>{p.debtDetail}</h3>
          <p className="card-subtitle mb-3">
            {p.debtDetailSub}{" "}
            {formatMoney(debtDetail?.totalDebt)} ({debtDetail?.count ?? 0}{" "}
            {p.debtInvoices}).
          </p>
          <button
            type="button"
            className="btn btn-secondary mb-3"
            disabled={exportingDebt}
            onClick={() => void xuatCongNoExcel()}
          >
            <IconDownload />{" "}
            {exportingDebt ? p.loading : p.exportExcel}
          </button>
          <BangDonGian
            data={debtDetail?.invoices ?? []}
            columns={[
              { header: s.id, render: (r: DebtInvoice) => r.id },
              {
                header: p.roomCode,
                render: (r: DebtInvoice) => r.roomCode ?? "—",
              },
              {
                header: p.tenant,
                render: (r: DebtInvoice) => r.tenantName ?? "—",
              },
              {
                header: p.period,
                render: (r: DebtInvoice) => `${r.month}/${r.year}`,
              },
              {
                header: p.amount,
                render: (r: DebtInvoice) => formatMoney(r.total),
              },
            ]}
          />
        </div>

        <div className="card">
          <h3>{p.vacantList}</h3>
          <p className="card-subtitle mb-3">
            {p.vacantListSub} ({vacantData?.vacantRooms ?? 0}{" "}
            {p.vacantCountSuffix}).
          </p>
          <BangDonGian
            data={vacantData?.rooms ?? []}
            columns={[
              { header: p.roomCode, render: (r: VacantRoom) => r.code },
              {
                header: p.area,
                render: (r: VacantRoom) => r.areaName ?? "—",
              },
              {
                header: p.currentPrice,
                render: (r: VacantRoom) => formatMoney(r.currentPrice),
              },
            ]}
          />
        </div>

        <div className="card">
          <h3>{p.roomStatus}</h3>
          <p className="card-subtitle mb-3">{p.roomStatusSub}</p>
          <div className="grid grid-4" style={{ gap: 12 }}>
            <div>
              <strong>{p.totalRooms}</strong> {occupancy?.totalRooms ?? "—"}
            </div>
            <div>
              <strong>{p.available}</strong> {occupancy?.available ?? "—"}
            </div>
            <div>
              <strong>{p.occupied}</strong> {occupancy?.occupied ?? "—"}
            </div>
            <div>
              <strong>{p.maintenance}</strong> {occupancy?.maintenance ?? "—"}
            </div>
          </div>
          <p className="mt-2 text-muted">
            {p.occupancyLabel}{" "}
            <strong>{occupancy?.occupancyRatePercent ?? "—"}%</strong>
          </p>
        </div>

        <div className="card">
          <h3>
            {p.invoiceReport} {invoiceSummary?.month}/{invoiceSummary?.year})
          </h3>
          <p className="card-subtitle mb-3">{p.invoiceReportSub}</p>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <div>
              <h4 style={{ marginBottom: 8, fontSize: 14 }}>
                {p.invoiceCountTitle}
              </h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td>{p.paid}</td>
                    <td>
                      <strong>{invoiceSummary?.countPaid ?? "—"}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>{p.unpaid}</td>
                    <td>
                      <strong>{invoiceSummary?.countUnpaid ?? "—"}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>{p.partial}</td>
                    <td>
                      <strong>{invoiceSummary?.countPartial ?? "—"}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>{p.total}</td>
                    <td>
                      <strong>{invoiceSummary?.countTotal ?? "—"}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 style={{ marginBottom: 8, fontSize: 14 }}>
                {p.invoiceSumTitle}
              </h4>
              <table className="table">
                <tbody>
                  <tr>
                    <td>{p.paid}</td>
                    <td>
                      <strong>{formatMoney(invoiceSummary?.sumPaid)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>{p.unpaid}</td>
                    <td>
                      <strong>{formatMoney(invoiceSummary?.sumUnpaid)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>{p.partial}</td>
                    <td>
                      <strong>{formatMoney(invoiceSummary?.sumPartial)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>{p.totalInvoiceAmount}</td>
                    <td>
                      <strong>{formatMoney(invoiceSummary?.sumTotal)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </TrangBaoVe>
  );
}
