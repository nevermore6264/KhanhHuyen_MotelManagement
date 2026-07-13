"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import TrangBaoVe from "@/components/TrangBaoVe";
import { IconReceipt, IconFile, IconHome, IconPlus } from "@/components/Icons";
import api from "@/lib/api";
import { getName, getRole } from "@/lib/auth";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { thayMauChuoi } from "@/lib/i18n";
import {
  dinhDangNgay,
  dinhDangSo,
  dinhDangThangNam,
  dinhDangTien,
  layLocaleTag,
} from "@/lib/locale";
import {
  nhanPhuongThucThanhToan,
  nhanTrangThaiHopDong,
} from "@/lib/trangThai";
import { chuanHoaDanhSachHopDongTuApi } from "@/lib/chuanHoaHopDongTuApi";
import {
  chuanHoaThanhToanTuApi,
  type PaymentRow,
} from "@/lib/chuanHoaThanhToanTuApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

type TomTatHoaDon = {
  month: number;
  year: number;
  countPaid: number;
  countUnpaid: number;
  countPartial: number;
  countTotal: number;
  sumPaid: number;
  sumUnpaid: number;
  sumPartial: number;
  sumTotal: number;
};

type HoaDonNo = {
  id: string;
  roomCode?: string;
  tenantName?: string;
  month?: number;
  year?: number;
  total?: number;
};

type Contract = {
  id: string;
  room?: { code: string };
  startDate?: string;
  endDate?: string;
  status?: string;
};

function MarqueeSloganDashboard({ slogans }: { slogans: readonly string[] }) {
  const items = [...slogans, ...slogans, ...slogans];
  return (
    <div className="dashboard-slogan-marquee" aria-hidden>
      <div className="dashboard-slogan-track">
        {items.map((text, i) => (
          <span key={i} className="dashboard-slogan-item">
            <span className="dashboard-slogan-text">{text}</span>
            <span className="dashboard-slogan-sep" aria-hidden>
              ★
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const IconDoc = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);
const IconUser = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconWallet = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M2 10h20" />
    <path d="M12 15a2 2 0 0 0 2-2 2 2 0 0 0-2-2" />
  </svg>
);
const IconChart = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export default function TrangTongQuan() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [vacant, setVacant] = useState(0);
  const [debt, setDebt] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [occupancy, setOccupancy] = useState({
    totalRooms: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    occupancyRatePercent: 0,
  });
  const [revenueByMonth, setRevenueByMonth] = useState<
    { month: number; revenue: number }[]
  >([]);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [invoiceSummary, setInvoiceSummary] = useState<TomTatHoaDon | null>(
    null,
  );
  const [unpaidInvoices, setUnpaidInvoices] = useState<HoaDonNo[]>([]);
  const [revenueYearTotal, setRevenueYearTotal] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [myContracts, setMyContracts] = useState<Contract[]>([]);
  const [myPayments, setMyPayments] = useState<PaymentRow[]>([]);

  const { t, lang } = useCaiDat();
  const dp = t.dashboardPro;
  const db = t.dashboard;
  const td = t.tenantDash;
  const localeTag = layLocaleTag(lang);
  const role = mounted ? getRole() : null;
  const isTenant = role === "TENANT";
  const tenNguoiDung = mounted ? getName() : null;
  const kyBaoCao = useMemo(() => {
    const d = new Date();
    return { thang: d.getMonth() + 1, nam: d.getFullYear() };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isTenant) {
      api
        .get("/hop-dong/cua-toi")
        .then((res) =>
          setMyContracts(chuanHoaDanhSachHopDongTuApi(res.data || [])),
        )
        .catch(() => setMyContracts([]));
      api
        .get("/thanh-toan/cua-toi?gioiHan=10")
        .then((res) =>
          setMyPayments(
            Array.isArray(res.data)
              ? res.data.map((x) =>
                  chuanHoaThanhToanTuApi(x as Record<string, unknown>),
                )
              : [],
          ),
        )
        .catch(() => setMyPayments([]));
      return;
    }
    const load = async () => {
      const { thang, nam } = kyBaoCao;
      setDangTai(true);
      try {
        const [tomTatRes, occRes, revYearRes, hoaDonRes, congNoRes] =
          await Promise.all([
            api.get(`/bao-cao/tom-tat?month=${thang}&year=${nam}`),
            api.get("/bao-cao/ty-le-lap-day"),
            api.get(`/bao-cao/doanh-thu-theo-nam?year=${nam}`),
            api.get(`/bao-cao/tom-tat-hoa-don?month=${thang}&year=${nam}`),
            api.get("/bao-cao/chi-tiet-cong-no"),
          ]);
        const tom = tomTatRes.data;
        setVacant(Number(tom.vacantRooms || 0));
        setDebt(Number(tom.totalDebt || 0));
        setRevenue(Number(tom.revenueMonth || 0));
        setUnpaidCount(Number(tom.unpaidCount || 0));
        setOccupancy({
          totalRooms: Number(occRes.data.totalRooms || tom.totalRooms || 0),
          available: Number(occRes.data.available || tom.vacantRooms || 0),
          occupied: Number(occRes.data.occupied || tom.occupiedRooms || 0),
          maintenance: Number(occRes.data.maintenance || 0),
          occupancyRatePercent: Number(occRes.data.occupancyRatePercent || 0),
        });
        const months = Array.isArray(revYearRes.data.months)
          ? revYearRes.data.months
          : [];
        setRevenueByMonth(
          months.map((m: { month?: number; revenue?: number }) => ({
            month: Number(m.month || 0),
            revenue: Number(m.revenue || 0),
          })),
        );
        setRevenueYearTotal(Number(revYearRes.data.total || 0));
        const hd = hoaDonRes.data;
        setInvoiceSummary({
          month: Number(hd.month || thang),
          year: Number(hd.year || nam),
          countPaid: Number(hd.countPaid || 0),
          countUnpaid: Number(hd.countUnpaid || 0),
          countPartial: Number(hd.countPartial || 0),
          countTotal: Number(hd.countTotal || 0),
          sumPaid: Number(hd.sumPaid || 0),
          sumUnpaid: Number(hd.sumUnpaid || 0),
          sumPartial: Number(hd.sumPartial || 0),
          sumTotal: Number(hd.sumTotal || 0),
        });
        const invoices = Array.isArray(congNoRes.data.invoices)
          ? congNoRes.data.invoices
          : [];
        setUnpaidInvoices(
          invoices.slice(0, 8).map((x: Record<string, unknown>) => ({
            id: String(x.id ?? ""),
            roomCode: x.roomCode != null ? String(x.roomCode) : undefined,
            tenantName:
              x.tenantName != null ? String(x.tenantName) : undefined,
            month: x.month != null ? Number(x.month) : undefined,
            year: x.year != null ? Number(x.year) : undefined,
            total: x.total != null ? Number(x.total) : undefined,
          })),
        );
        if (!tom.unpaidCount && congNoRes.data.count != null) {
          setUnpaidCount(Number(congNoRes.data.count));
        }
      } catch {
        try {
          const vacantRes = await api.get("/bao-cao/phong-trong");
          setVacant(vacantRes.data.vacantRooms || 0);
        } catch {}
        try {
          const debtRes = await api.get("/bao-cao/cong-no");
          setDebt(Number(debtRes.data.totalDebt || 0));
          setUnpaidCount(Number(debtRes.data.count || 0));
        } catch {}
        try {
          const revRes = await api.get(
            `/bao-cao/doanh-thu?month=${thang}&year=${nam}`,
          );
          setRevenue(Number(revRes.data.revenue || 0));
        } catch {}
      } finally {
        setDangTai(false);
      }
    };
    load();
  }, [mounted, isTenant, kyBaoCao]);

  const formatNumber = (value: number) => dinhDangSo(value, lang);
  const formatMoney = (value: number) => dinhDangTien(value, lang, { short: true });

  const goiYHomNay = useMemo(() => {
    const list: { text: string; href?: string; uuTien?: "warn" | "ok" }[] = [];
    if (vacant > 0) {
      list.push({
        text: thayMauChuoi(dp.tips.vacant, { n: formatNumber(vacant) }),
        href: "/phong",
      });
    }
    if (unpaidCount > 0) {
      list.push({
        text: thayMauChuoi(dp.tips.debt, {
          n: formatNumber(unpaidCount),
          amount: formatNumber(debt),
        }),
        href: "/hoa-don",
        uuTien: "warn",
      });
    }
    if (
      occupancy.totalRooms > 0 &&
      occupancy.occupancyRatePercent < 75
    ) {
      list.push({
        text: thayMauChuoi(dp.tips.occupancy, {
          pct: occupancy.occupancyRatePercent,
        }),
        href: "/phong",
      });
    }
    if (occupancy.maintenance > 0) {
      list.push({
        text: thayMauChuoi(dp.tips.maintenance, {
          n: formatNumber(occupancy.maintenance),
        }),
        href: "/phong",
      });
    }
    if (list.length === 0) {
      list.push({
        text: dp.tips.stable,
        href: "/chi-so-dien-nuoc",
        uuTien: "ok",
      });
    }
    return list;
  }, [vacant, unpaidCount, debt, occupancy, dp, lang]);

  const barChartData = useMemo(
    () => ({
      labels: [db.vacant, db.debt, db.revenue],
      datasets: [
        {
          label: dp.quickOverview,
          data: [vacant, debt, revenue],
          backgroundColor: ["#bae6fd", "#0ea5e9", "#059669"],
          borderRadius: 8,
          maxBarThickness: 52,
        },
      ],
    }),
    [vacant, debt, revenue, db.vacant, db.debt, db.revenue, dp.quickOverview],
  );

  const barChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${formatNumber(ctx.parsed.y ?? 0)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#78716c", font: { size: 11 } },
        },
        y: {
          grid: { color: "rgba(28, 25, 23, 0.06)" },
          ticks: {
            color: "#78716c",
            callback: (value: number | string) => formatNumber(Number(value)),
          },
        },
      },
    }),
    [lang],
  );

  const doughnutData = useMemo(
    () => ({
      labels: [dp.vacant, dp.occupied, dp.maintenance],
      datasets: [
        {
          data: [
            occupancy.available,
            occupancy.occupied,
            occupancy.maintenance,
          ],
          backgroundColor: ["#bae6fd", "#0ea5e9", "#94a3b8"],
          borderWidth: 0,
        },
      ],
    }),
    [occupancy, dp.vacant, dp.occupied, dp.maintenance, lang],
  );

  const lineData = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    const series: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const thang = d.getMonth() + 1;
      labels.push(`${thang}/${d.getFullYear()}`);
      const muc = revenueByMonth.find((m) => m.month === thang);
      series.push(Math.round(muc?.revenue ?? 0));
    }
    return {
      labels,
      datasets: [
        {
          label: dp.revenueChartLabel,
          data: series,
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14, 165, 233, 0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#0284c7",
          pointBorderWidth: 2,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
      ],
    };
  }, [revenueByMonth, dp.revenueChartLabel]);

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            boxWidth: 10,
            padding: 14,
            font: { size: 11, family: "'Nunito', system-ui, sans-serif" },
            color: "#64748b",
          },
        },
      },
      cutout: "72%",
    }),
    [],
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          titleFont: { size: 12, weight: "bold" as const },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 6,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
          },
          border: { display: false },
        },
        y: {
          grid: { color: "rgba(15, 23, 42, 0.06)" },
          ticks: {
            color: "#64748b",
            font: { size: 11 },
            callback: (value: number | string) => formatNumber(Number(value)),
          },
          border: { display: false },
        },
      },
    }),
    [],
  );

  const tyLeThuTien = useMemo(() => {
    if (!invoiceSummary || invoiceSummary.sumTotal <= 0) return 0;
    return Math.round((invoiceSummary.sumPaid / invoiceSummary.sumTotal) * 100);
  }, [invoiceSummary]);

  const doanhThuBinhQuanPhong = useMemo(() => {
    if (occupancy.occupied <= 0) return 0;
    return Math.round(revenue / occupancy.occupied);
  }, [revenue, occupancy.occupied]);

  const doanhThuThangTruoc = useMemo(() => {
    const thangTruoc = kyBaoCao.thang === 1 ? 12 : kyBaoCao.thang - 1;
    return revenueByMonth.find((m) => m.month === thangTruoc)?.revenue ?? 0;
  }, [revenueByMonth, kyBaoCao.thang]);

  const xuHuongDoanhThu = useMemo(() => {
    if (doanhThuThangTruoc <= 0) return null;
    return Math.round(
      ((revenue - doanhThuThangTruoc) / doanhThuThangTruoc) * 100,
    );
  }, [revenue, doanhThuThangTruoc]);

  const tyLeHoaDon = (count: number) =>
    invoiceSummary && invoiceSummary.countTotal > 0
      ? Math.round((count / invoiceSummary.countTotal) * 100)
      : 0;

  const TAC_VU_NHANH = useMemo(
    () => [
      { href: "/khu-vuc", ...dp.tasks.zones },
      { href: "/phong", ...dp.tasks.rooms },
      { href: "/hop-dong", ...dp.tasks.contracts },
      { href: "/hoa-don", ...dp.tasks.invoices },
      { href: "/khach-thue", ...dp.tasks.tenants },
      { href: "/chi-so-dien-nuoc", ...dp.tasks.utilities },
      { href: "/bao-cao", ...dp.tasks.reports },
    ],
    [dp.tasks, lang],
  );

  if (mounted && isTenant) {
    return (
      <TrangBaoVe>
      <div className="page-shell page-dashboard">
          <div className="dashboard-hero">
            <div>
              <h2>{td.title}</h2>
              <p>{td.lead}</p>
              <div className="hero-actions">
                <Link className="btn" href="/thanh-toan-cua-toi">
                  <IconReceipt /> {td.goPayments}
                </Link>
                <Link className="btn btn-secondary" href="/hop-dong-cua-toi">
                  <IconFile /> {td.viewContract}
                </Link>
              </div>
            </div>
            <div className="hero-pill hero-pill-clock">
              <span>{mounted ? now.toLocaleDateString(localeTag) : "—"}</span>
              <span className="hero-pill-time" suppressHydrationWarning>
                {mounted
                  ? now.toLocaleTimeString(localeTag, {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                  : "—:—:—"}
              </span>
            </div>
          </div>

          <MarqueeSloganDashboard slogans={[td.marquee]} />

          <div className="dashboard-tenant-grid">
            <div className="card">
              <h3 className="card-title">
                <span className="card-title-icon">
                  <IconDoc />
                </span>
                {td.myContracts}
              </h3>
              {myContracts.length === 0 ? (
                <p className="text-muted">{td.noContracts}</p>
              ) : (
                <ul className="dashboard-contract-list">
                  {myContracts.map((c) => (
                    <li key={c.id}>
                      <span className="contract-room">
                        {td.room} {c.room?.code ?? "—"}
                      </span>
                      <span className="contract-dates">
                        {dinhDangNgay(c.startDate, lang)} –{" "}
                        {dinhDangNgay(c.endDate, lang)}
                      </span>
                      <span className="contract-status">
                        {nhanTrangThaiHopDong(t, c.status)}
                      </span>
                      <Link href="/hop-dong-cua-toi" className="link-small">
                        {td.viewDetail}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="dashboard-tenant-card-actions">
                <Link
                  href="/hop-dong-cua-toi"
                  className="btn btn-secondary btn-sm"
                >
                  {td.allContracts}
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">
                <span className="card-title-icon">
                  <IconUser />
                </span>
                {td.landlord}
              </h3>
              <p className="text-muted" style={{ marginBottom: 8 }}>
                {td.landlordHint}
              </p>
              <div className="dashboard-tenant-card-actions">
                <Link href="/yeu-cau" className="btn btn-secondary btn-sm">
                  {td.sendRequest}
                </Link>
              </div>
            </div>
          </div>

          <div className="dashboard-tenant-section">
            <div className="card" style={{ marginTop: "1.25rem" }}>
              <h3 className="card-title">
                <span className="card-title-icon">
                  <IconReceipt />
                </span>
                {td.recentPayments}
              </h3>
              {myPayments.length === 0 ? (
                <p className="text-muted">{td.noPayments}</p>
              ) : (
                <div className="dashboard-payment-list-wrap">
                  <table className="dashboard-payment-table">
                    <thead>
                      <tr>
                        <th>{td.period}</th>
                        <th>{td.amount}</th>
                        <th>{td.method}</th>
                        <th>{td.paidAt}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPayments.map((p) => (
                        <tr key={p.id}>
                          <td>
                            {p.invoice
                              ? dinhDangThangNam(
                                  p.invoice.month,
                                  p.invoice.year,
                                  lang,
                                )
                              : "—"}
                          </td>
                          <td>
                            {Number.isFinite(p.amount)
                              ? formatMoney(p.amount)
                              : "—"}
                          </td>
                          <td>{nhanPhuongThucThanhToan(t, p.method)}</td>
                          <td>{dinhDangNgay(p.paidAt, lang)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div
                className="dashboard-tenant-card-actions"
                style={{ marginTop: 12 }}
              >
                <Link
                  href="/thanh-toan-cua-toi"
                  className="btn btn-secondary btn-sm"
                >
                  {td.allPayments}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </TrangBaoVe>
    );
  }

  return (
    <TrangBaoVe>
      <div
        className={`page-shell page-dashboard page-dashboard--pulse${dangTai ? " page-dashboard--loading" : ""}`}
      >
        <header className="dash-x-hero">
          <div className="dash-x-hero__text">
            <p className="dash-x-hero__period">
              {dp.monthLabel} {kyBaoCao.thang} · {kyBaoCao.nam}
            </p>
            <h1 className="dash-x-hero__title">
              {dp.greeting}
              {tenNguoiDung?.trim() ? `, ${tenNguoiDung.trim()}` : ""}
            </h1>
            <p className="dash-x-hero__lead">{dp.lead}</p>
          </div>
          <div className="dash-x-hero__meta">
            <div className="dash-x-clock" aria-live="polite">
              <span className="dash-x-clock__label">{dp.clockLabel}</span>
              <span className="dash-x-clock__date">
                {mounted ? now.toLocaleDateString(localeTag) : "—"}
              </span>
              <span className="dash-x-clock__time" suppressHydrationWarning>
                {mounted
                  ? now.toLocaleTimeString(localeTag, {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                  : "—:—:—"}
              </span>
            </div>
          </div>
          <nav className="dash-x-hero__nav">
            <Link className="btn" href="/phong">
              <IconHome /> {dp.manageRooms}
            </Link>
            <Link className="btn btn-secondary" href="/hop-dong">
              <IconPlus /> {dp.createContract}
            </Link>
            <Link className="btn btn-secondary" href="/hoa-don">
              <IconReceipt /> {dp.collectInvoices}
            </Link>
            <Link className="btn btn-secondary" href="/bao-cao">
              <IconChart /> {dp.reports}
            </Link>
          </nav>
        </header>

        <div className="dash-x-ticker">
          <MarqueeSloganDashboard slogans={dp.slogans} />
        </div>

        <section className="dash-x-kpis">
          <div className="dash-x-kpi dash-x-kpi--revenue">
            <span className="dash-x-kpi__label">{dp.revenueMonth}</span>
            <span className="dash-x-kpi__value">
              {formatMoney(revenue)}
            </span>
            <span className="dash-x-kpi__meta">
              {xuHuongDoanhThu != null ? (
                <span
                  className={
                    xuHuongDoanhThu >= 0
                      ? "dash-x-trend--up"
                      : "dash-x-trend--down"
                  }
                >
                  {xuHuongDoanhThu >= 0 ? "+" : "−"}
                  {Math.abs(xuHuongDoanhThu)}% {dp.vsLastMonth}
                </span>
              ) : (
                dinhDangThangNam(kyBaoCao.thang, kyBaoCao.nam, lang)
              )}
              {" · "}
              {dp.yearTotal}: {formatMoney(revenueYearTotal)}
            </span>
          </div>
          <div className="dash-x-kpi dash-x-kpi--collect">
            <span className="dash-x-kpi__label">{dp.collectionRate}</span>
            <span className="dash-x-kpi__value">
              {tyLeThuTien}
              <small>%</small>
            </span>
            <span className="dash-x-kpi__meta">
              {invoiceSummary
                ? `${formatNumber(invoiceSummary.countPaid)}/${formatNumber(invoiceSummary.countTotal)} ${dp.invoicesPaid}`
                : "—"}
            </span>
            <div className="dash-x-kpi__bar">
              <span style={{ width: `${tyLeThuTien}%` }} />
            </div>
          </div>
          <div className="dash-x-kpi dash-x-kpi--occ">
            <span className="dash-x-kpi__label">{dp.occupancyAvg}</span>
            <span className="dash-x-kpi__value">
              {occupancy.occupancyRatePercent}
              <small>%</small>
            </span>
            <span className="dash-x-kpi__meta">
              {formatNumber(occupancy.occupied)} / {formatNumber(occupancy.totalRooms)}{" "}
              {dp.roomsRented} · {dp.avgPerRoom}: {formatMoney(doanhThuBinhQuanPhong)}
            </span>
          </div>
          <Link href="/hoa-don" className="dash-x-kpi dash-x-kpi--debt">
            <span className="dash-x-kpi__label">{db.debt}</span>
            <span className="dash-x-kpi__value">{formatMoney(debt)}</span>
            <span className="dash-x-kpi__meta">
              {formatNumber(unpaidCount)} {dp.unpaidInvoices}
            </span>
          </Link>
        </section>

        <nav className="dash-x-links" aria-label={dp.quickTasks}>
          {TAC_VU_NHANH.map((task) => (
            <Link key={task.href} href={task.href} className="dash-x-link">
              <strong>{task.label}</strong>
              <span>{task.desc}</span>
            </Link>
          ))}
        </nav>

        <div className="dash-x-layout">
          <div className="dash-x-col-main">
            <article className="dash-x-card dash-x-card--chart">
              <div className="dash-x-card__head">
                <div>
                  <h3 className="dash-x-card__title">{dp.revenue6m}</h3>
                  <p className="dash-x-card__sub">{dp.revenueTrend}</p>
                </div>
                <span className="dash-x-card__badge">
                  {dp.year} {kyBaoCao.nam}
                </span>
              </div>
              <div className="dash-x-chart-box dash-x-chart-box--tall">
                <Line data={lineData} options={lineOptions} />
              </div>
            </article>
            <div className="dash-x-charts-row">
              <article className="dash-x-card">
                <h3 className="dash-x-card__title">{dp.quickOverview}</h3>
                <div className="dash-x-chart-box">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </article>
              <article className="dash-x-card">
                <h3 className="dash-x-card__title">{db.occupancyChart}</h3>
                <div className="dash-x-chart-box dash-x-chart-box--donut">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </article>
            </div>
          </div>

          <aside className="dash-x-col-side">
            <div className="dash-x-ytd">
              <span>{dp.yearRevenue}</span>
              <strong>{formatMoney(revenueYearTotal)}</strong>
            </div>

            <section className="dash-x-card">
              <div className="dash-x-card__head">
                <div>
                  <h3 className="dash-x-card__title">{dp.invoiceMonth}</h3>
                  <p className="dash-x-card__sub">
                    {invoiceSummary
                      ? dinhDangThangNam(
                          invoiceSummary.month,
                          invoiceSummary.year,
                          lang,
                        )
                      : dinhDangThangNam(kyBaoCao.thang, kyBaoCao.nam, lang)}
                  </p>
                </div>
                <Link href="/hoa-don" className="dash-x-card__link">
                  {dp.viewAll} →
                </Link>
              </div>
              {invoiceSummary ? (
              <>
                <div className="dash-invoice-metrics">
                  <div className="dash-metric">
                    <span className="dash-metric__label">{dp.totalInv}</span>
                    <span className="dash-metric__value">
                      {formatNumber(invoiceSummary.countTotal)}
                    </span>
                    <span className="dash-metric__money">
                      {formatMoney(invoiceSummary.sumTotal)}
                    </span>
                  </div>
                  <div className="dash-metric dash-metric--paid">
                    <span className="dash-metric__label">{dp.paid}</span>
                    <span className="dash-metric__value">
                      {formatNumber(invoiceSummary.countPaid)}
                    </span>
                    <span className="dash-metric__money">
                      {formatMoney(invoiceSummary.sumPaid)}
                    </span>
                  </div>
                  <div className="dash-metric dash-metric--unpaid">
                    <span className="dash-metric__label">{dp.unpaid}</span>
                    <span className="dash-metric__value">
                      {formatNumber(invoiceSummary.countUnpaid)}
                    </span>
                    <span className="dash-metric__money">
                      {formatMoney(invoiceSummary.sumUnpaid)}
                    </span>
                  </div>
                  <div className="dash-metric dash-metric--partial">
                    <span className="dash-metric__label">{dp.partial}</span>
                    <span className="dash-metric__value">
                      {formatNumber(invoiceSummary.countPartial)}
                    </span>
                    <span className="dash-metric__money">
                      {formatMoney(invoiceSummary.sumPartial)}
                    </span>
                  </div>
                </div>
                <div className="dash-progress-list">
                  <div className="dash-progress">
                    <div className="dash-progress__row">
                      <span>{dp.paidShort}</span>
                      <span>{tyLeHoaDon(invoiceSummary.countPaid)}%</span>
                    </div>
                    <div className="dash-progress__bar">
                      <span
                        className="dash-progress__fill dash-progress__fill--paid"
                        style={{
                          width: `${tyLeHoaDon(invoiceSummary.countPaid)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="dash-progress">
                    <div className="dash-progress__row">
                      <span>{dp.unpaidShort}</span>
                      <span>{tyLeHoaDon(invoiceSummary.countUnpaid)}%</span>
                    </div>
                    <div className="dash-progress__bar">
                      <span
                        className="dash-progress__fill dash-progress__fill--unpaid"
                        style={{
                          width: `${tyLeHoaDon(invoiceSummary.countUnpaid)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="dash-progress">
                    <div className="dash-progress__row">
                      <span>{dp.partialShort}</span>
                      <span>{tyLeHoaDon(invoiceSummary.countPartial)}%</span>
                    </div>
                    <div className="dash-progress__bar">
                      <span
                        className="dash-progress__fill dash-progress__fill--partial"
                        style={{
                          width: `${tyLeHoaDon(invoiceSummary.countPartial)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="dash-x-empty">{dp.noInvoiceData}</p>
            )}
            </section>

            <section className="dash-x-card">
              <div className="dash-x-card__head">
                <div>
                  <h3 className="dash-x-card__title">{dp.roomStatus}</h3>
                  <p className="dash-x-card__sub">{dp.byStatus}</p>
                </div>
                <Link href="/phong" className="dash-x-card__link">
                  {dp.roomList} →
                </Link>
              </div>
            <div className="dash-occupancy">
              <div
                className="dash-occupancy__ring"
                style={
                  {
                    "--occ-pct": occupancy.occupancyRatePercent,
                  } as import("react").CSSProperties
                }
              >
                <span className="dash-occupancy__pct">
                  {occupancy.occupancyRatePercent}%
                </span>
                <span className="dash-occupancy__label">{dp.fillRate}</span>
              </div>
              <ul className="dash-room-breakdown">
                <li>
                  <span className="dash-room-dot dash-room-dot--avail" />
                  <span>{dp.vacant}</span>
                  <strong>{formatNumber(occupancy.available)}</strong>
                </li>
                <li>
                  <span className="dash-room-dot dash-room-dot--occ" />
                  <span>{dp.occupied}</span>
                  <strong>{formatNumber(occupancy.occupied)}</strong>
                </li>
                <li>
                  <span className="dash-room-dot dash-room-dot--maint" />
                  <span>{dp.maintenance}</span>
                  <strong>{formatNumber(occupancy.maintenance)}</strong>
                </li>
              </ul>
            </div>
            <div className="dash-room-bars">
              {[
                {
                  label: dp.vacant,
                  count: occupancy.available,
                  pct:
                    occupancy.totalRooms > 0
                      ? (occupancy.available / occupancy.totalRooms) * 100
                      : 0,
                  cls: "avail",
                },
                {
                  label: dp.occupied,
                  count: occupancy.occupied,
                  pct:
                    occupancy.totalRooms > 0
                      ? (occupancy.occupied / occupancy.totalRooms) * 100
                      : 0,
                  cls: "occ",
                },
                {
                  label: dp.maintenance,
                  count: occupancy.maintenance,
                  pct:
                    occupancy.totalRooms > 0
                      ? (occupancy.maintenance / occupancy.totalRooms) * 100
                      : 0,
                  cls: "maint",
                },
              ].map((row) => (
                <div key={row.label} className="dash-room-bar">
                  <div className="dash-room-bar__row">
                    <span>{row.label}</span>
                    <span>
                      {formatNumber(row.count)} ({Math.round(row.pct)}%)
                    </span>
                  </div>
                  <div className="dash-room-bar__track">
                    <span
                      className={`dash-room-bar__fill dash-room-bar__fill--${row.cls}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            </section>
          </aside>
        </div>

        <div className="dash-x-bottom">
          <section className="dash-x-card">
            <div className="dash-x-card__head">
              <h3 className="dash-x-card__title">{dp.todayTips}</h3>
              <span className="dash-x-card__badge">{goiYHomNay.length}</span>
            </div>
            <ul className="dash-x-tips">
              {goiYHomNay.map((item, i) => (
                <li
                  key={i}
                  className={
                    item.uuTien === "warn"
                      ? "dash-x-tips--warn"
                      : item.uuTien === "ok"
                        ? "dash-x-tips--ok"
                        : undefined
                  }
                >
                  <span className="dash-x-tips__num">{i + 1}</span>
                  {item.href ? (
                    <Link href={item.href}>{item.text}</Link>
                  ) : (
                    item.text
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="dash-x-card">
            <div className="dash-x-card__head">
              <div>
                <h3 className="dash-x-card__title">{dp.debtTitle}</h3>
                <p className="dash-x-card__sub">
                  {unpaidCount > 0
                    ? `${formatNumber(unpaidCount)} ${dp.debtMeta} ${formatMoney(debt)}`
                    : dp.noDebt}
                </p>
              </div>
              <Link href="/hoa-don" className="dash-x-card__link">
                {dp.handleInvoices} →
              </Link>
            </div>
            {unpaidInvoices.length > 0 ? (
              <ul className="dash-x-debt-list">
                {unpaidInvoices.map((row, idx) => (
                  <li key={row.id} className="dash-x-debt-item">
                    <span className="dash-x-debt-item__rank">{idx + 1}</span>
                    <div>
                      <strong>{row.roomCode || "—"}</strong>
                      <span className="dash-x-debt-item__sub">
                        {row.tenantName || dp.unknownTenant}
                      </span>
                    </div>
                    <span>
                      {row.month && row.year
                        ? `T${row.month}/${row.year}`
                        : "—"}
                    </span>
                    <span className="dash-x-debt-item__amt">
                      {row.total != null ? formatMoney(row.total) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dash-x-empty dash-x-empty--ok">{dp.noDebtOk}</p>
            )}
          </section>
        </div>
      </div>
    </TrangBaoVe>
  );
}
