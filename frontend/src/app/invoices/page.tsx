"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";

type Room = { id: number; code: string };
type Tenant = { id: number; fullName: string };
type Invoice = {
  id: number;
  room?: Room;
  tenant?: Tenant;
  month: number;
  year: number;
  total?: number;
  status?: string;
};

const invoiceStatusLabel = (value?: string) => {
  switch (value) {
    case "UNPAID":
      return "Chưa thanh toán";
    case "PARTIAL":
      return "Thanh toán một phần";
    case "PAID":
      return "Đã thanh toán";
    default:
      return value || "-";
  }
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roomId, setRoomId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [roomCost, setRoomCost] = useState("");
  const [electricityCost, setElectricityCost] = useState("");
  const [waterCost, setWaterCost] = useState("");

  const load = async () => {
    const [iRes, rRes, tRes] = await Promise.all([
      api.get("/invoices"),
      api.get("/rooms"),
      api.get("/tenants"),
    ]);
    setInvoices(iRes.data);
    setRooms(rRes.data);
    setTenants(tRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/invoices", {
      room: roomId ? { id: Number(roomId) } : null,
      tenant: tenantId ? { id: Number(tenantId) } : null,
      month: Number(month),
      year: Number(year),
      roomCost: roomCost ? Number(roomCost) : null,
      electricityCost: electricityCost ? Number(electricityCost) : null,
      waterCost: waterCost ? Number(waterCost) : null,
      total:
        Number(roomCost || 0) +
          Number(electricityCost || 0) +
          Number(waterCost || 0) || 0,
    });
    setRoomId("");
    setTenantId("");
    setMonth("");
    setYear("");
    setRoomCost("");
    setElectricityCost("");
    setWaterCost("");
    load();
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Hóa đơn</h2>
        <div className="card">
          <form onSubmit={create} className="grid grid-3">
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              <option value="">Chọn phòng</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code}
                </option>
              ))}
            </select>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            >
              <option value="">Chọn khách thuê</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
            <input
              placeholder="Tháng"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <input
              placeholder="Năm"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <input
              placeholder="Tiền phòng"
              value={roomCost}
              onChange={(e) => setRoomCost(e.target.value)}
            />
            <input
              placeholder="Tiền điện"
              value={electricityCost}
              onChange={(e) => setElectricityCost(e.target.value)}
            />
            <input
              placeholder="Tiền nước"
              value={waterCost}
              onChange={(e) => setWaterCost(e.target.value)}
            />
            <button className="btn" type="submit">
              Tạo hóa đơn
            </button>
          </form>
        </div>
        <div className="card">
          <SimpleTable
            data={invoices}
            columns={[
              { header: "ID", render: (i) => i.id },
              { header: "Phòng", render: (i) => i.room?.code },
              { header: "Khách", render: (i) => i.tenant?.fullName },
              { header: "Tháng/Năm", render: (i) => `${i.month}/${i.year}` },
              { header: "Tổng", render: (i) => i.total },
              {
                header: "Trạng thái",
                render: (i) => invoiceStatusLabel(i.status),
              },
            ]}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
