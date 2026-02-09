"use client";

import { useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import NavBar from '@/components/NavBar';
import api from '@/lib/api';

export default function ReportsPage() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [revenue, setRevenue] = useState('0');
  const [vacant, setVacant] = useState('0');
  const [debt, setDebt] = useState('0');

  const load = async () => {
    if (month && year) {
      const res = await api.get(`/reports/revenue?month=${month}&year=${year}`);
      setRevenue(String(res.data.revenue || 0));
    }
    const vacantRes = await api.get('/reports/vacant');
    setVacant(String(vacantRes.data.vacantRooms || 0));
    const debtRes = await api.get('/reports/debt');
    setDebt(String(debtRes.data.totalDebt || 0));
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Báo cáo & thống kê</h2>
        <div className="card grid grid-3">
          <input placeholder="Tháng" value={month} onChange={(e) => setMonth(e.target.value)} />
          <input placeholder="Năm" value={year} onChange={(e) => setYear(e.target.value)} />
          <button className="btn" onClick={load}>Xem báo cáo</button>
        </div>
        <div className="grid grid-3">
          <div className="card">Doanh thu: {revenue}</div>
          <div className="card">Phòng trống: {vacant}</div>
          <div className="card">Công nợ: {debt}</div>
        </div>
      </div>
    </ProtectedPage>
  );
}
