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
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.09 6.26L21 9.27l-5 4.87L17.18 21 12 17.77 6.82 21 8 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>
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
          backgroundColor: ["#fcd34d", "#ea580c", "#059669"],
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
            label: (ctx: { parsed: { y: number } }) =>
              `${formatNumber(ctx.parsed.y)}`,
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
          backgroundColor: ["#fcd34d", "#7c3aed", "#a8a29e"],
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
          borderColor: "#ea580c",
          backgroundColor: "rgba(234, 88, 12, 0.08)",
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#ea580c",
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
          titleFont: { size: 12, weight: "600" as const },
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

  const diemVanHanh = useMemo(() => {
    const occ = occupancy.occupancyRatePercent;
    const thu = tyLeThuTien;
    const noDebt =
      unpaidCount === 0 ? 100 : Math.max(0, 100 - unpaidCount * 8);
    return Math.min(100, Math.round(occ * 0.45 + thu * 0.35 + noDebt * 0.2));
  }, [occupancy.occupancyRatePercent, tyLeThuTien, unpaidCount]);

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

          <div className="dashboard-slogan-marquee" aria-hidden>
            <div className="dashboard-slogan-track">
              <span>{td.marquee}</span>
              <span>{td.marquee}</span>
              <span>{td.marquee}</span>
            </div>
          </div>

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
      <div className="page-shell page-dashboard page-dashboard--studio">
        <header className="dash-studio-bar">
          <div className="dash-studio-bar__main">
            <span className="dash-studio-bar__period">
              {dp.monthLabel} {kyBaoCao.thang} · {kyBaoCao.nam}
            </span>
            <h2 className="dash-studio-bar__title">
              {dp.greeting}
              {tenNguoiDung?.trim() ? `, ${tenNguoiDung.trim()}` : ""}
            </h2>
            <p className="dash-studio-bar__lead">{dp.lead}</p>
          </div>
          <aside className="dash-studio-bar__aside">
            <div className="dash-studio-bar__clock">
              <span className="dash-studio-bar__date">
                {mounted ? now.toLocaleDateString(localeTag) : "—"}
              </span>
              <span className="dash-studio-bar__time" suppressHydrationWarning>
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
            <div
              className="dash-studio-bar__health"
              style={
                { "--health-pct": diemVanHanh } as import("react").CSSProperties
              }
            >
              <div className="dash-studio-bar__health-ring">
                <span>{diemVanHanh}</span>
              </div>
              <div className="dash-studio-bar__health-text">
                <strong>{dp.opsScore}</strong>
                <span>
                  {diemVanHanh >= 80
                    ? dp.opsExcellent
                    : diemVanHanh >= 60
                      ? dp.opsGood
                      : dp.opsWarn}
                </span>
              </div>
            </div>
          </aside>
          <div className="dash-studio-bar__actions">
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
          </div>
        </header>

        <MarqueeSloganDashboard slogans={dp.slogans} />

        <div className={`stat-grid stat-grid--studio${dangTai ? " stat-grid--loading" : ""}`}>
          <div className="card stat-card accent-rose">
            <div className="stat-icon">
              <IconHome />
            </div>
            <div>
              <div className="stat-label">{db.vacant}</div>
              <div className="stat-value">{formatNumber(vacant)}</div>
              <div className="stat-note">{dp.vacantNote}</div>
            </div>
          </div>
          <div className="card stat-card accent-pink">
            <div className="stat-icon">
              <IconWallet />
            </div>
            <div>
              <div className="stat-label">{db.debt}</div>
              <div className="stat-value">{formatMoney(debt)}</div>
              <div className="stat-note">{dp.debtNote}</div>
            </div>
          </div>
          <div className="card stat-card accent-peach">
            <div className="stat-icon">
              <IconChart />
            </div>
            <div>
              <div className="stat-label">{db.revenue}</div>
              <div className="stat-value">{formatMoney(revenue)}</div>
              <div className="stat-note">{dp.revenueNote}</div>
            </div>
          </div>
          <div className="card stat-card accent-sky">
            <div className="stat-icon">
              <IconChart />
            </div>
            <div>
              <div className="stat-label">{db.occupancy}</div>
              <div className="stat-value">{occupancy.occupancyRatePercent}%</div>
              <div className="stat-note">
                {formatNumber(occupancy.occupied)}/{formatNumber(occupancy.totalRooms)}{" "}
                {dp.roomsRented}
              </div>
            </div>
          </div>
        </div>

        <section
          className={`dash-studio-bento${dangTai ? " dash-spotlight--loading" : ""}`}
        >
        <div className={`dash-spotlight${dangTai ? " dash-spotlight--loading" : ""}`}>
          <article className="dash-spotlight__card dash-spotlight__card--revenue">
            <span className="dash-spotlight__eyebrow">{dp.revenueMonth}</span>
            <p className="dash-spotlight__value">
              {formatNumber(revenue)}
              <small>đ</small>
            </p>
            <p className="dash-spotlight__meta">
              {xuHuongDoanhThu != null ? (
                <span
                  className={
                    xuHuongDoanhThu >= 0
                      ? "dash-trend dash-trend--up"
                      : "dash-trend dash-trend--down"
                  }
                >
                  {xuHuongDoanhThu >= 0 ? "+" : "−"}
                  {Math.abs(xuHuongDoanhThu)}% {dp.vsLastMonth}
                </span>
              ) : (
                <span>
                  {dinhDangThangNam(kyBaoCao.thang, kyBaoCao.nam, lang)}
                </span>
              )}
            </p>
            <p className="dash-spotlight__sub">
              {dp.yearTotal} {kyBaoCao.nam}: <strong>{formatMoney(revenueYearTotal)}</strong>
            </p>
          </article>
          <article className="dash-spotlight__card dash-spotlight__card--collect">
            <span className="dash-spotlight__eyebrow">{dp.collectionRate}</span>
            <p className="dash-spotlight__value">
              {tyLeThuTien}
              <small>%</small>
            </p>
            <p className="dash-spotlight__meta">
              {invoiceSummary
                ? `${formatNumber(invoiceSummary.countPaid)}/${formatNumber(invoiceSummary.countTotal)} ${dp.invoicesPaid}`
                : "—"}
            </p>
            <div className="dash-spotlight__bar">
              <span style={{ width: `${tyLeThuTien}%` }} />
            </div>
          </article>
          <article className="dash-spotlight__card dash-spotlight__card--occ">
            <span className="dash-spotlight__eyebrow">{dp.occupancyAvg}</span>
            <p className="dash-spotlight__value">
              {occupancy.occupancyRatePercent}
              <small>%</small>
            </p>
            <p className="dash-spotlight__meta">
              {formatNumber(occupancy.occupied)} / {formatNumber(occupancy.totalRooms)} {dp.roomsRented}
            </p>
            <p className="dash-spotlight__sub">
              {dp.avgPerRoom}: <strong>{formatMoney(doanhThuBinhQuanPhong)}</strong>
            </p>
          </article>
        </div>

        <div
          className={`dash-kpi-grid${dangTai ? " dash-kpi-grid--loading" : ""}`}
        >
          {[
            {
              href: "/phong",
              accent: "blue",
              icon: <IconHome />,
              label: dp.totalRooms,
              value: formatNumber(occupancy.totalRooms),
              note: `${formatNumber(vacant)} ${dp.vacant} · ${formatNumber(occupancy.maintenance)} ${dp.maintenance}`,
            },
            {
              href: "/phong",
              accent: "sky",
              icon: <IconUser />,
              label: dp.occupied,
              value: formatNumber(occupancy.occupied),
              note: `${occupancy.occupancyRatePercent}% ${dp.fillRate}`,
            },
            {
              href: "/hoa-don",
              accent: "green",
              icon: <IconReceipt />,
              label: dp.collectedMonth,
              value: invoiceSummary
                ? formatMoney(invoiceSummary.sumPaid)
                : "—",
              note: invoiceSummary
                ? `${formatNumber(invoiceSummary.countPaid)} ${dp.invoices}`
                : "—",
            },
            {
              href: "/hoa-don",
              accent: "amber",
              icon: <IconWallet />,
              label: t.dashboard.debt,
              value: formatMoney(debt),
              note: `${formatNumber(unpaidCount)} ${dp.unpaidInvoices}`,
            },
            {
              href: "/hop-dong",
              accent: "violet",
              icon: <IconFile />,
              label: dp.vacant,
              value: formatNumber(vacant),
              note: dp.vacantReady,
            },
            {
              href: "/chi-so-dien-nuoc",
              accent: "slate",
              icon: <IconChart />,
              label: dp.utilities,
              value: dp.enter,
              note: dp.utilitiesHint,
            },
          ].map((kpi) => (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`dash-kpi dash-kpi--${kpi.accent}`}
            >
              <div className="dash-kpi__icon">{kpi.icon}</div>
              <div className="dash-kpi__body">
                <span className="dash-kpi__label">{kpi.label}</span>
                <span className="dash-kpi__value">{kpi.value}</span>
                <span className="dash-kpi__note">{kpi.note}</span>
              </div>
            </Link>
          ))}
        </div>
        </section>

        <div className="dashboard-mid">
          <section className="card dash-panel dash-panel--invoice">
            <div className="dash-panel__head">
              <div>
                <h3 className="dash-panel__title">{dp.invoiceMonth}</h3>
                <p className="dash-panel__sub">
                  {invoiceSummary
                    ? dinhDangThangNam(
                        invoiceSummary.month,
                        invoiceSummary.year,
                        lang,
                      )
                    : dinhDangThangNam(kyBaoCao.thang, kyBaoCao.nam, lang)}
                </p>
              </div>
              <Link href="/hoa-don" className="dash-panel__link">
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
              <p className="dash-empty">{dp.noInvoiceData}</p>
            )}
          </section>

          <section className="card dash-panel dash-panel--rooms">
            <div className="dash-panel__head">
              <div>
                <h3 className="dash-panel__title">{dp.roomStatus}</h3>
                <p className="dash-panel__sub">{dp.byStatus}</p>
              </div>
              <Link href="/phong" className="dash-panel__link">
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
        </div>

        <div className="quick-grid quick-grid--studio">
          <div className="card quick-card">
            <div className="quick-title">{dp.quickTasks}</div>
            <div className="quick-actions quick-actions--grid">
              <Link href="/khu-vuc">{dp.quickActions.addZone}</Link>
              <Link href="/phong">{dp.quickActions.addRoom}</Link>
              <Link href="/khach-thue">{dp.quickActions.addTenant}</Link>
              <Link href="/chi-so-dien-nuoc">{dp.quickActions.addUtilities}</Link>
            </div>
          </div>
          <div className="card quick-card">
            <div className="quick-title">{dp.todayTips}</div>
            <ul className="dash-studio-quick-tips">
              {goiYHomNay.map((item, i) => (
                <li
                  key={i}
                  className={
                    item.uuTien === "warn"
                      ? "dash-studio-quick-tips__item--warn"
                      : item.uuTien === "ok"
                        ? "dash-studio-quick-tips__item--ok"
                        : undefined
                  }
                >
                  {item.href ? (
                    <Link href={item.href}>{item.text}</Link>
                  ) : (
                    item.text
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="overview-grid overview-grid--studio">
          <div className="card chart-card">
            <div className="chart-title">{dp.quickOverview}</div>
            <div className="chart-canvas">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
          <div className="card chart-card">
            <div className="chart-title">{db.occupancyChart}</div>
            <div className="chart-canvas chart-canvas--donut">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        <div className="chart-grid chart-grid--studio">
          <div className="card chart-card wide-chart dash-chart-main">
            <div className="dash-chart-head">
              <div>
                <h3 className="chart-title">{dp.revenue6m}</h3>
                <p className="chart-sub">{dp.revenueTrend}</p>
              </div>
              <div className="dash-chart-head__right">
                <div className="card dash-side-stat dash-side-stat--inline">
                  <span className="dash-side-stat__label">{dp.yearRevenue}</span>
                  <span className="dash-side-stat__value">
                    {formatMoney(revenueYearTotal)}
                  </span>
                </div>
                <div className="dash-chart-badge">
                  {dp.year} {kyBaoCao.nam}
                </div>
              </div>
            </div>
            <div className="chart-canvas chart-canvas--tall">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>

        <div className="dashboard-bottom">
          <section className="card dash-panel dash-panel--tasks">
            <div className="dash-panel__head">
              <h3 className="dash-panel__title">{dp.quickTasks}</h3>
            </div>
            <div className="dash-task-grid">
              {TAC_VU_NHANH.map((task) => (
                <Link key={task.href} href={task.href} className="dash-task">
                  <span className="dash-task__label">{task.label}</span>
                  <span className="dash-task__desc">{task.desc}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="card dash-panel dash-panel--insights">
            <div className="dash-panel__head">
              <h3 className="dash-panel__title">{dp.todayTips}</h3>
              <span className="dash-panel__count">{goiYHomNay.length}</span>
            </div>
            <ul className="dash-insight-list">
              {goiYHomNay.map((item, i) => (
                <li
                  key={i}
                  className={
                    item.uuTien === "warn"
                      ? "dash-insight dash-insight--warn"
                      : item.uuTien === "ok"
                        ? "dash-insight dash-insight--ok"
                        : "dash-insight"
                  }
                >
                  <span className="dash-insight__num">{i + 1}</span>
                  <div className="dash-insight__body">
                    {item.href ? (
                      <Link href={item.href}>{item.text}</Link>
                    ) : (
                      item.text
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="card dash-panel dash-panel--debt dash-panel--debt-v2">
          <div className="dash-panel__head">
            <div>
              <h3 className="dash-panel__title">{dp.debtTitle}</h3>
              <p className="dash-panel__sub">
                {unpaidCount > 0
                  ? `${formatNumber(unpaidCount)} ${dp.debtMeta} ${formatMoney(debt)}`
                  : dp.noDebt}
              </p>
            </div>
            <Link href="/hoa-don" className="dash-panel__link">
              {dp.handleInvoices} →
            </Link>
          </div>
          {unpaidInvoices.length > 0 ? (
            <ul className="dash-debt-list">
              {unpaidInvoices.map((row, idx) => (
                <li key={row.id} className="dash-debt-item">
                  <span className="dash-debt-item__rank">{idx + 1}</span>
                  <div className="dash-debt-item__main">
                    <strong>{row.roomCode || "—"}</strong>
                    <span>{row.tenantName || dp.unknownTenant}</span>
                  </div>
                  <span className="dash-debt-item__period">
                    {row.month && row.year
                      ? `T${row.month}/${row.year}`
                      : "—"}
                  </span>
                  <span className="dash-debt-item__amount">
                    {row.total != null
                      ? formatMoney(row.total)
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dash-empty dash-empty--ok">
              {dp.noDebtOk}
            </p>
          )}
        </section>
      </div>
    </TrangBaoVe>
  );
}
