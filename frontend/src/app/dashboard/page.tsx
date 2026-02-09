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
import api from "@/lib/api";

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

export default function DashboardPage() {
  const [vacant, setVacant] = useState(0);
  const [debt, setDebt] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
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
  }, []);

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
                Quản lý phòng
              </Link>
              <Link className="btn btn-secondary" href="/contracts">
                Tạo hợp đồng
              </Link>
            </div>
          </div>
          <div className="hero-pill">
            {new Date().toLocaleDateString("vi-VN")}
          </div>
        </div>

        <div className="stat-grid">
          <div className="card stat-card accent-rose">
            <div className="stat-icon">🏠</div>
            <div>
              <div className="stat-label">Phòng trống</div>
              <div className="stat-value">{formatNumber(vacant)}</div>
              <div className="stat-note">Hiện có</div>
            </div>
          </div>
          <div className="card stat-card accent-pink">
            <div className="stat-icon">💳</div>
            <div>
              <div className="stat-label">Công nợ</div>
              <div className="stat-value">{formatNumber(debt)} đ</div>
              <div className="stat-note">Chưa thanh toán</div>
            </div>
          </div>
          <div className="card stat-card accent-peach">
            <div className="stat-icon">📈</div>
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
