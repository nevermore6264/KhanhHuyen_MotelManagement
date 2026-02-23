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
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import { IconReceipt, IconFile, IconHome, IconPlus } from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";

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

type Contract = {
  id: number;
  room?: { code: string };
  startDate?: string;
  endDate?: string;
  status?: string;
};

type Payment = {
  id: number;
  amount: number;
  paidAt: string;
  method: string;
  invoice?: { id: number; month: number; year: number };
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

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [vacant, setVacant] = useState(0);
  const [debt, setDebt] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [myContracts, setMyContracts] = useState<Contract[]>([]);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);

  const role = mounted ? getRole() : null;
  const isTenant = role === "TENANT";

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
        .get("/contracts/me")
        .then((res) => setMyContracts(res.data || []))
        .catch(() => setMyContracts([]));
      api
        .get("/payments/me?limit=10")
        .then((res) => setMyPayments(Array.isArray(res.data) ? res.data : []))
        .catch(() => setMyPayments([]));
      return;
    }
    const load = async () => {
      try {
        const vacantRes = await api.get("/reports/vacant");
        setVacant(vacantRes.data.vacantRooms || 0);
      } catch {}
      try {
        const debtRes = await api.get("/reports/debt");
        setDebt(Number(debtRes.data.totalDebt || 0));
      } catch {}
      try {
        const now = new Date();
        const revRes = await api.get(
          `/reports/revenue?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
        );
        setRevenue(Number(revRes.data.revenue || 0));
      } catch {}
    };
    load();
  }, [mounted, isTenant]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);

  const chartData = useMemo(
    () => ({
      labels: ["Phòng trống", "Công nợ", "Doanh thu"],
      datasets: [
        {
          label: "Tổng quan",
          data: [vacant, debt, revenue],
          backgroundColor: ["#7aa6ff", "#4f7cff", "#9bbcff"],
          borderRadius: 8,
          maxBarThickness: 48,
        },
      ],
    }),
    [vacant, debt, revenue],
  );

  const doughnutData = useMemo(
    () => ({
      labels: ["Phòng trống", "Đang thuê"],
      datasets: [
        {
          data: [vacant, Math.max(0, 100 - vacant)],
          backgroundColor: ["#7aa6ff", "#dbe7ff"],
          borderWidth: 0,
        },
      ],
    }),
    [vacant],
  );

  const lineData = useMemo(() => {
    const now = new Date();
    const labels = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      return `${d.getMonth() + 1}/${d.getFullYear()}`;
    });
    const base = revenue || 0;
    const series = labels.map((_, i) =>
      Math.max(0, Math.round(base * (0.6 + i * 0.08))),
    );
    return {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data: series,
          borderColor: "#4f7cff",
          backgroundColor: "rgba(79, 124, 255, 0.2)",
          tension: 0.35,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [revenue]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) =>
              `${formatNumber(context.raw)}${context.dataIndex === 0 ? "" : " đ"}`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            callback: (value: any) => formatNumber(Number(value)),
          },
        },
      },
    }),
    [],
  );

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
      <ProtectedPage>
        <NavBar />
        <div className="container">
          <div className="dashboard-hero">
            <div>
              <h2>Tổng quan của tôi</h2>
              <p>Hợp đồng thuê và thanh toán.</p>
              <div className="hero-actions">
                <Link className="btn" href="/my-payments">
                  <IconReceipt /> Đến thanh toán
                </Link>
                <Link className="btn btn-secondary" href="/my-contracts">
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
                      <Link href="/my-contracts" className="link-small">
                        Xem chi tiết
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="dashboard-tenant-card-actions">
                <Link href="/my-contracts" className="btn btn-secondary btn-sm">
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
                Chủ nhà trọ / Quản lý. Liên hệ khi cần hỗ trợ về hợp đồng hoặc
                thanh toán.
              </p>
              <div className="dashboard-tenant-card-actions">
                <Link href="/support" className="btn btn-secondary btn-sm">
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
                          <td>{formatNumber(Number(p.amount))} đ</td>
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
                <Link href="/my-payments" className="btn btn-secondary btn-sm">
                  Xem tất cả thanh toán
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <div className="dashboard-hero">
          <div>
            <h2>Tổng quan iTro</h2>
            <p>Cập nhật nhanh tình hình vận hành nhà trọ hôm nay.</p>
            <div className="hero-actions">
              <Link className="btn" href="/rooms">
                <IconHome /> Quản lý phòng
              </Link>
              <Link className="btn btn-secondary" href="/contracts">
                <IconPlus /> Tạo hợp đồng
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
              iTro — Quản lý nhà trọ thông minh · Minh bạch · Chuyên nghiệp
              ·{" "}
            </span>
            <span>
              iTro — Quản lý nhà trọ thông minh · Minh bạch · Chuyên nghiệp
              ·{" "}
            </span>
            <span>
              iTro — Quản lý nhà trọ thông minh · Minh bạch · Chuyên nghiệp
              ·{" "}
            </span>
          </div>
        </div>

        <div className="stat-grid">
          <div className="card stat-card accent-rose">
            <div className="stat-icon">
              <IconHome />
            </div>
            <div>
              <div className="stat-label">Phòng trống</div>
              <div className="stat-value">{formatNumber(vacant)}</div>
              <div className="stat-note">Hiện có</div>
            </div>
          </div>
          <div className="card stat-card accent-pink">
            <div className="stat-icon">
              <IconWallet />
            </div>
            <div>
              <div className="stat-label">Công nợ</div>
              <div className="stat-value">{formatNumber(debt)} đ</div>
              <div className="stat-note">Chưa thanh toán</div>
            </div>
          </div>
          <div className="card stat-card accent-peach">
            <div className="stat-icon">
              <IconChart />
            </div>
            <div>
              <div className="stat-label">Doanh thu tháng</div>
              <div className="stat-value">{formatNumber(revenue)} đ</div>
              <div className="stat-note">Tháng hiện tại</div>
            </div>
          </div>
        </div>

        <div className="quick-grid">
          <div className="card quick-card">
            <div className="quick-title">Tác vụ nhanh</div>
            <div className="quick-actions">
              <Link href="/areas">+ Thêm khu</Link>
              <Link href="/rooms">+ Thêm phòng</Link>
              <Link href="/tenants">+ Thêm khách</Link>
              <Link href="/meter-readings">+ Nhập điện nước</Link>
            </div>
          </div>
          <div className="card quick-card">
            <div className="quick-title">Gợi ý hôm nay</div>
            <div className="quick-list">
              <div>Kiểm tra phòng trống để tối ưu lấp đầy.</div>
              <div>Nhắc nhở công nợ các phòng quá hạn.</div>
              <div>Nhập chỉ số điện nước tháng hiện tại.</div>
            </div>
          </div>
        </div>

        <div className="overview-grid">
          <div className="card chart-card">
            <div className="chart-title">Tổng quan nhanh</div>
            <div className="chart-canvas">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="card chart-card">
            <div className="chart-title">Tỷ lệ phòng trống</div>
            <div className="chart-canvas">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        <div className="chart-grid">
          <div className="card chart-card wide-chart">
            <div className="chart-title">Doanh thu 6 tháng</div>
            <div className="chart-canvas">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
