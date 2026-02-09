"use client";

import { useEffect, useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import NavBar from '@/components/NavBar';
import SimpleTable from '@/components/SimpleTable';
import api from '@/lib/api';

type SupportRequest = {
  id: number;
  title: string;
  description?: string;
  status: string;
  tenant?: { fullName: string };
  room?: { code: string };
};

export default function SupportRequestsPage() {
  const [items, setItems] = useState<SupportRequest[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('OPEN');

  const load = async () => {
    const res = await api.get('/support-requests');
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    await api.put(`/support-requests/${selectedId}`, { status });
    setSelectedId('');
    setStatus('OPEN');
    load();
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Yêu cầu hỗ trợ</h2>
        <div className="card">
          <form onSubmit={updateStatus} className="grid grid-3">
            <input placeholder="ID yêu cầu" value={selectedId} onChange={(e) => setSelectedId(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="OPEN">Mới</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã xử lý</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
            <button className="btn" type="submit">Cập nhật</button>
          </form>
        </div>
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: 'ID', render: (r) => r.id },
              { header: 'Tiêu đề', render: (r) => r.title },
              { header: 'Khách', render: (r) => r.tenant?.fullName },
              { header: 'Phòng', render: (r) => r.room?.code },
              { header: 'Trạng thái', render: (r) => r.status }
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
