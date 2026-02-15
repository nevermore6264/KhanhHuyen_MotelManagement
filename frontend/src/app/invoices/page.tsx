"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

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

const invoiceStatusBadge = (value?: string) => {
  switch (value) {
    case "PAID":
      return "status-available";
    case "PARTIAL":
      return "status-maintenance";
    case "UNPAID":
      return "status-occupied";
    default:
      return "status-unknown";
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
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const role = getRole();
  const isTenant = role === "TENANT";
  const isAdmin = role === "ADMIN";
  const { notify } = useToast();

  const load = async () => {
    try {
      if (isTenant) {
        const res = await api.get("/invoices/me");
        setInvoices(res.data);
        setRooms([]);
        setTenants([]);
        return;
      }
      const [iRes, rRes, tRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/rooms"),
        api.get("/tenants"),
      ]);
      setInvoices(iRes.data);
      setRooms(rRes.data);
      setTenants(tRes.data);
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền xem danh sách hóa đơn"
          : "Tải dữ liệu hóa đơn thất bại";
      notify(message, "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !tenantId) {
      setError("Vui lòng chọn phòng và khách thuê");
      return;
    }
    if (!month || !year) {
      setError("Vui lòng nhập tháng và năm");
      return;
    }
    if (!roomCost || !electricityCost || !waterCost) {
      setError("Vui lòng nhập đầy đủ tiền phòng, điện, nước");
      return;
    }
    setError("");
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
    notify("Tạo hóa đơn thành công", "success");
    setRoomId("");
    setTenantId("");
    setMonth("");
    setYear("");
    setRoomCost("");
    setElectricityCost("");
    setWaterCost("");
    setShowCreate(false);
    load();
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Hóa đơn</h2>
        <div className="card">
          <div className="grid grid-2">
            <div>
              <h3>Danh sách hóa đơn</h3>
              <p className="card-subtitle">Theo dõi thanh toán theo kỳ.</p>
            </div>
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(true)}>
                  Tạo hóa đơn
                </button>
              </div>
            )}
          </div>
          {!isAdmin && (
            <div className="form-error" style={{ marginTop: 12 }}>
              {isTenant
                ? "Bạn chỉ có thể xem hóa đơn của chính mình."
                : "Bạn chỉ có quyền xem dữ liệu."}
            </div>
          )}
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
                render: (i) => (
                  <span
                    className={`status-badge ${invoiceStatusBadge(i.status)}`}
                  >
                    {invoiceStatusLabel(i.status)}
                  </span>
                ),
              },
            ]}
          />
        </div>

        {showCreate && isAdmin && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Tạo hóa đơn</h3>
                  <p className="card-subtitle">Chọn phòng, khách và chi phí</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">
                    Phòng <span className="required">*</span>
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  >
                    <option value="">Chọn phòng</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    Khách thuê <span className="required">*</span>
                  </label>
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
                </div>
                <div>
                  <label className="field-label">
                    Tháng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Tháng"
                    inputMode="numeric"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Năm <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Năm"
                    inputMode="numeric"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Tiền phòng <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Tiền phòng"
                      inputMode="numeric"
                      value={roomCost}
                      onChange={(e) => setRoomCost(e.target.value)}
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Tiền điện <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Tiền điện"
                      inputMode="numeric"
                      value={electricityCost}
                      onChange={(e) => setElectricityCost(e.target.value)}
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Tiền nước <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Tiền nước"
                      inputMode="numeric"
                      value={waterCost}
                      onChange={(e) => setWaterCost(e.target.value)}
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setShowCreate(false)}
                  >
                    Hủy
                  </button>
                  <button className="btn" type="submit">
                    Tạo hóa đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
