"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import TrangBaoVe from "@/components/TrangBaoVe";
import { IconReceipt, IconFile, IconHome, IconPlus } from "@/components/Icons";
import api from "@/lib/api";
import { getName, getRole } from "@/lib/auth";
import { chuanHoaDanhSachHopDongTuApi } from "@/lib/chuanHoaHopDongTuApi";
import {
  chuanHoaThanhToanTuApi,
  type PaymentRow,
} from "@/lib/chuanHoaThanhToanTuApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
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

const paymentMethodLabel = (value?: string) => {
  switch (value) {
    case "CASH":
      return "Tiền mặt";
    case "TRANSFER":
      return "Chuyển khoản";
    default:
      return value || "-";
  }
};

const contractStatusLabel = (value?: string) => {
  switch (value) {
    case "ACTIVE":
      return "Đang hiệu lực";
    case "ENDED":
      return "Đã kết thúc";
    case "TERMINATED":
      return "Đã hủy";
    default:
      return value || "-";
  }
};

const SLOGAN_DASHBOARD = [
  "iTro — Nhà trọ gọn gàng",
  "Thuê an tâm",
  "Thanh toán dễ dàng",
];

function MarqueeSloganDashboard() {
  const items = [...SLOGAN_DASHBOARD, ...SLOGAN_DASHBOARD, ...SLOGAN_DASHBOARD];
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

const formatDateDMY = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

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
  const [dangTai, setDangTai] = useState(true);
  const [myContracts, setMyContracts] = useState<Contract[]>([]);
  const [myPayments, setMyPayments] = useState<PaymentRow[]>([]);

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

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);

  const goiYHomNay = useMemo(() => {
    const list: { text: string; href?: string; uuTien?: "warn" | "ok" }[] = [];
    if (vacant > 0) {
      list.push({
        text: `Có ${formatNumber(vacant)} phòng trống — cập nhật trạng thái hoặc đăng tin.`,
        href: "/phong",
      });
    }
    if (unpaidCount > 0) {
      list.push({
        text: `${formatNumber(unpaidCount)} hóa đơn chưa thanh toán (${formatNumber(debt)} đ).`,
        href: "/hoa-don",
        uuTien: "warn",
      });
    }
    if (
      occupancy.totalRooms > 0 &&
      occupancy.occupancyRatePercent < 75
    ) {
      list.push({
        text: `Tỷ lệ lấp đầy ${occupancy.occupancyRatePercent}% — cần tăng tốc cho thuê.`,
        href: "/phong",
      });
    }
    if (occupancy.maintenance > 0) {
      list.push({
        text: `${formatNumber(occupancy.maintenance)} phòng đang bảo trì.`,
        href: "/phong",
      });
    }
    if (list.length === 0) {
      list.push({
        text: "Vận hành ổn định — nhập chỉ số điện nước đầu tháng.",
        href: "/chi-so-dien-nuoc",
        uuTien: "ok",
      });
    }
    return list;
  }, [vacant, unpaidCount, debt, occupancy]);

  const doughnutData = useMemo(
    () => ({
      labels: ["Phòng trống", "Đang thuê", "Bảo trì"],
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
    [occupancy],
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
          label: "Doanh thu",
          data: series,
          borderColor: "#0284c7",
          backgroundColor: "rgba(14, 165, 233, 0.15)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [revenueByMonth]);

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { position: "bottom" as const } },
      cutout: "65%",
    }),
    [],
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          ticks: {
            callback: (value: any) => formatNumber(Number(value)),
          },
        },
      },
    }),
    [],
  );

  if (mounted && isTenant) {
    return (
      <TrangBaoVe>
      <div className="page-shell page-dashboard">
          <div className="dashboard-hero">
            <div>
              <h2>Tổng quan của tôi</h2>
              <p>Hợp đồng thuê và thanh toán.</p>
              <div className="hero-actions">
                <Link className="btn" href="/thanh-toan-cua-toi">
                  <IconReceipt /> Đến thanh toán
                </Link>
                <Link className="btn btn-secondary" href="/hop-dong-cua-toi">
                  <IconFile /> Xem hợp đồng
                </Link>
              </div>
            </div>
            <div className="hero-pill hero-pill-clock">
              <span>{mounted ? now.toLocaleDateString("vi-VN") : "—"}</span>
              <span className="hero-pill-time" suppressHydrationWarning>
                {mounted
                  ? now.toLocaleTimeString("vi-VN", {
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
              <span>
                🏠 Ngôi nhà thứ hai — Thuê an tâm, thanh toán dễ dàng ·{" "}
              </span>
              <span>
                🏠 Ngôi nhà thứ hai — Thuê an tâm, thanh toán dễ dàng ·{" "}
              </span>
              <span>
                🏠 Ngôi nhà thứ hai — Thuê an tâm, thanh toán dễ dàng ·{" "}
              </span>
            </div>
          </div>

          <div className="dashboard-tenant-grid">
            <div className="card">
              <h3 className="card-title">
                <span className="card-title-icon">
                  <IconDoc />
                </span>
                Hợp đồng của tôi
              </h3>
              {myContracts.length === 0 ? (
                <p className="text-muted">Chưa có hợp đồng.</p>
              ) : (
                <ul className="dashboard-contract-list">
                  {myContracts.map((c) => (
                    <li key={c.id}>
                      <span className="contract-room">
                        Phòng {c.room?.code ?? "—"}
                      </span>
                      <span className="contract-dates">
                        {formatDateDMY(c.startDate)} –{" "}
                        {formatDateDMY(c.endDate)}
                      </span>
                      <span className="contract-status">
                        {contractStatusLabel(c.status)}
                      </span>
                      <Link href="/hop-dong-cua-toi" className="link-small">
                        Xem chi tiết
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
                  Xem tất cả hợp đồng
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">
                <span className="card-title-icon">
                  <IconUser />
                </span>
                Bên cho thuê
              </h3>
              <p className="text-muted" style={{ marginBottom: 8 }}>
                Đội ngũ nhà trọ luôn sẵn sàng hỗ trợ bạn về hợp đồng hoặc thanh toán.
              </p>
              <div className="dashboard-tenant-card-actions">
                <Link href="/yeu-cau" className="btn btn-secondary btn-sm">
                  Gửi yêu cầu hỗ trợ
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
                Lịch sử thanh toán gần đây
              </h3>
              {myPayments.length === 0 ? (
                <p className="text-muted">Chưa có giao dịch thanh toán.</p>
              ) : (
                <div className="dashboard-payment-list-wrap">
                  <table className="dashboard-payment-table">
                    <thead>
                      <tr>
                        <th>Kỳ</th>
                        <th>Số tiền</th>
                        <th>Hình thức</th>
                        <th>Ngày thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPayments.map((p) => (
                        <tr key={p.id}>
                          <td>
                            {p.invoice
                              ? `Tháng ${p.invoice.month}/${p.invoice.year}`
                              : "—"}
                          </td>
                          <td>
                            {Number.isFinite(p.amount)
                              ? `${formatNumber(p.amount)} đ`
                              : "—"}
                          </td>
                          <td>{paymentMethodLabel(p.method)}</td>
                          <td>{formatDateDMY(p.paidAt)}</td>
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
                  Xem tất cả thanh toán
                </Link>
              </div>
            </div>
          </div>
        </div>
      </TrangBaoVe>
    );
  }

  const tyLeHoaDon = (count: number) =>
    invoiceSummary && invoiceSummary.countTotal > 0
      ? Math.round((count / invoiceSummary.countTotal) * 100)
      : 0;

  return (
    <TrangBaoVe>
      <div className="page-shell page-dashboard page-dashboard--admin">
        <div className="dashboard-hero dashboard-hero--rich">
          <div className="dashboard-hero__main">
            <span className="dashboard-hero__badge">
              Báo cáo tháng {kyBaoCao.thang}/{kyBaoCao.nam}
            </span>
            <h2 className="page-heading">
              Chào {tenNguoiDung?.trim() || "bạn"} 👋
            </h2>
            <p className="page-lead">
              Tổng quan vận hành nhà trọ — phòng, hóa đơn, doanh thu và công nợ
              trên một màn hình.
            </p>
            <div className="dashboard-hero__chips">
              <span className="dash-chip">
                <strong>{formatNumber(occupancy.totalRooms)}</strong> phòng
              </span>
              <span className="dash-chip">
                Lấp đầy{" "}
                <strong>{occupancy.occupancyRatePercent}%</strong>
              </span>
              <span className="dash-chip dash-chip--warn">
                Nợ <strong>{formatNumber(unpaidCount)}</strong> HĐ
              </span>
            </div>
            <div className="hero-actions">
              <Link className="btn" href="/phong">
                <IconHome /> Quản lý phòng
              </Link>
              <Link className="btn btn-secondary" href="/hoa-don">
                <IconReceipt /> Hóa đơn
              </Link>
              <Link className="btn btn-secondary" href="/bao-cao">
                <IconChart /> Báo cáo
              </Link>
            </div>
          </div>
          <div className="hero-pill hero-pill-clock">
            <span>{mounted ? now.toLocaleDateString("vi-VN") : "—"}</span>
            <span className="hero-pill-time" suppressHydrationWarning>
              {mounted
                ? now.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })
                : "—:—:—"}
            </span>
          </div>
        </div>

        <MarqueeSloganDashboard />

        <div
          className={`stat-grid stat-grid--rich${dangTai ? " stat-grid--loading" : ""}`}
        >
          <div className="card stat-card accent-rose">
            <div className="stat-icon">
              <IconHome />
            </div>
            <div>
              <div className="stat-label">Tổng phòng</div>
              <div className="stat-value">
                {formatNumber(occupancy.totalRooms)}
              </div>
              <div className="stat-note">Toàn hệ thống</div>
            </div>
          </div>
          <div className="card stat-card accent-sky">
            <div className="stat-icon">
              <IconUser />
            </div>
            <div>
              <div className="stat-label">Đang thuê</div>
              <div className="stat-value">
                {formatNumber(occupancy.occupied)}
              </div>
              <div className="stat-note">
                {occupancy.occupancyRatePercent}% lấp đầy
              </div>
            </div>
          </div>
          <div className="card stat-card accent-peach">
            <div className="stat-icon">
              <IconHome />
            </div>
            <div>
              <div className="stat-label">Phòng trống</div>
              <div className="stat-value">{formatNumber(vacant)}</div>
              <div className="stat-note">Sẵn sàng cho thuê</div>
            </div>
          </div>
          <div className="card stat-card accent-pink">
            <div className="stat-icon">
              <IconChart />
            </div>
            <div>
              <div className="stat-label">Bảo trì</div>
              <div className="stat-value">
                {formatNumber(occupancy.maintenance)}
              </div>
              <div className="stat-note">Tạm ngưng</div>
            </div>
          </div>
          <div className="card stat-card accent-rose">
            <div className="stat-icon">
              <IconChart />
            </div>
            <div>
              <div className="stat-label">Doanh thu tháng</div>
              <div className="stat-value">{formatNumber(revenue)} đ</div>
              <div className="stat-note">
                Tháng {kyBaoCao.thang}/{kyBaoCao.nam}
              </div>
            </div>
          </div>
          <div className="card stat-card accent-pink">
            <div className="stat-icon">
              <IconWallet />
            </div>
            <div>
              <div className="stat-label">Công nợ</div>
              <div className="stat-value">{formatNumber(debt)} đ</div>
              <div className="stat-note">
                {formatNumber(unpaidCount)} hóa đơn chưa TT
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-mid">
          <section className="card dash-panel dash-panel--invoice">
            <div className="dash-panel__head">
              <div>
                <h3 className="dash-panel__title">Hóa đơn tháng</h3>
                <p className="dash-panel__sub">
                  {invoiceSummary
                    ? `Tháng ${invoiceSummary.month}/${invoiceSummary.year}`
                    : `Tháng ${kyBaoCao.thang}/${kyBaoCao.nam}`}
                </p>
              </div>
              <Link href="/hoa-don" className="dash-panel__link">
                Xem tất cả →
              </Link>
            </div>
            {invoiceSummary ? (
              <>
                <div className="dash-invoice-metrics">
                  <div className="dash-metric">
                    <span className="dash-metric__label">Tổng HĐ</span>
                    <span className="dash-metric__value">
                      {formatNumber(invoiceSummary.countTotal)}
                    </span>
                    <span className="dash-metric__money">
                      {formatNumber(invoiceSummary.sumTotal)} đ
                    </span>
                  </div>
                  <div className="dash-metric dash-metric--paid">
                    <span className="dash-metric__label">Đã thanh toán</span>
                    <span className="dash-metric__value">
                      {formatNumber(invoiceSummary.countPaid)}
                    </span>
                    <span className="dash-metric__money">
                      {formatNumber(invoiceSummary.sumPaid)} đ
                    </span>
                  </div>
                  <div className="dash-metric dash-metric--unpaid">
                    <span className="dash-metric__label">Chưa thanh toán</span>
                    <span className="dash-metric__value">
                      {formatNumber(invoiceSummary.countUnpaid)}
                    </span>
                    <span className="dash-metric__money">
                      {formatNumber(invoiceSummary.sumUnpaid)} đ
                    </span>
                  </div>
                  <div className="dash-metric dash-metric--partial">
                    <span className="dash-metric__label">Thanh toán một phần</span>
                    <span className="dash-metric__value">
                      {formatNumber(invoiceSummary.countPartial)}
                    </span>
                    <span className="dash-metric__money">
                      {formatNumber(invoiceSummary.sumPartial)} đ
                    </span>
                  </div>
                </div>
                <div className="dash-progress-list">
                  <div className="dash-progress">
                    <div className="dash-progress__row">
                      <span>Đã TT</span>
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
                      <span>Chưa TT</span>
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
                      <span>Một phần</span>
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
              <p className="dash-empty">Chưa có dữ liệu hóa đơn tháng này.</p>
            )}
          </section>

          <section className="card dash-panel dash-panel--rooms">
            <div className="dash-panel__head">
              <div>
                <h3 className="dash-panel__title">Tình trạng phòng</h3>
                <p className="dash-panel__sub">Phân bổ theo trạng thái</p>
              </div>
              <Link href="/phong" className="dash-panel__link">
                Danh sách phòng →
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
                <span className="dash-occupancy__label">Lấp đầy</span>
              </div>
              <ul className="dash-room-breakdown">
                <li>
                  <span className="dash-room-dot dash-room-dot--avail" />
                  <span>Phòng trống</span>
                  <strong>{formatNumber(occupancy.available)}</strong>
                </li>
                <li>
                  <span className="dash-room-dot dash-room-dot--occ" />
                  <span>Đang thuê</span>
                  <strong>{formatNumber(occupancy.occupied)}</strong>
                </li>
                <li>
                  <span className="dash-room-dot dash-room-dot--maint" />
                  <span>Bảo trì</span>
                  <strong>{formatNumber(occupancy.maintenance)}</strong>
                </li>
              </ul>
            </div>
            <div className="chart-canvas chart-canvas--compact">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </section>
        </div>

        <div className="quick-grid dashboard-actions-row">
          <div className="card quick-card">
            <div className="quick-title">Tác vụ nhanh</div>
            <div className="quick-actions quick-actions--grid">
              <Link href="/khu-vuc">+ Khu vực</Link>
              <Link href="/phong">+ Phòng</Link>
              <Link href="/khach-thue">+ Khách thuê</Link>
              <Link href="/hop-dong">+ Hợp đồng</Link>
              <Link href="/chi-so-dien-nuoc">+ Điện nước</Link>
              <Link href="/yeu-cau">+ Yêu cầu</Link>
            </div>
          </div>
          <div className="card quick-card">
            <div className="quick-title">Gợi ý hôm nay</div>
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

        <div className="chart-grid">
          <div className="card chart-card wide-chart">
            <div className="chart-title">Doanh thu 6 tháng gần nhất</div>
            <p className="chart-sub">
              Tổng doanh thu đã thu theo từng tháng (VNĐ)
            </p>
            <div className="chart-canvas">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>

        <section className="card dash-panel dash-panel--debt">
          <div className="dash-panel__head">
            <div>
              <h3 className="dash-panel__title">Hóa đơn chưa thanh toán</h3>
              <p className="dash-panel__sub">
                {unpaidCount > 0
                  ? `${formatNumber(unpaidCount)} hóa đơn · ${formatNumber(debt)} đ`
                  : "Không có công nợ"}
              </p>
            </div>
            <Link href="/bao-cao" className="dash-panel__link">
              Báo cáo chi tiết →
            </Link>
          </div>
          {unpaidInvoices.length > 0 ? (
            <div className="table-wrap dash-debt-table">
              <table>
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Khách thuê</th>
                    <th>Kỳ</th>
                    <th>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidInvoices.map((row) => (
                    <tr key={row.id}>
                      <td>{row.roomCode || "—"}</td>
                      <td>{row.tenantName || "—"}</td>
                      <td>
                        {row.month && row.year
                          ? `${row.month}/${row.year}`
                          : "—"}
                      </td>
                      <td>
                        {row.total != null
                          ? `${formatNumber(row.total)} đ`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="dash-empty dash-empty--ok">
              Tuyệt vời — không có hóa đơn quá hạn.
            </p>
          )}
        </section>
      </div>
    </TrangBaoVe>
  );
}
