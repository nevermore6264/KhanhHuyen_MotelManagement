"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

type Room = { id: number; code: string };
type Tenant = { id: number; fullName: string; email?: string; phone?: string };
type Invoice = {
  id: number;
  room?: Room;
  tenant?: Tenant;
  month: number;
  year: number;
  roomCost?: number;
  electricityCost?: number;
  waterCost?: number;
  total?: number;
  status?: string;
  lastReminderEmailAt?: string | null;
  lastReminderSmsAt?: string | null;
};

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(Number(n))) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

const formatReminderDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
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
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRoomId, setFilterRoomId] = useState("");
  const [remindingId, setRemindingId] = useState<number | null>(null);
  const role = getRole();
  const isTenant = role === "TENANT";
  const isAdmin = role === "ADMIN";
  const canRemind = (isAdmin || role === "STAFF") && !isTenant;
  const { notify } = useToast();

  const sendReminder = async (invoiceId: number, channel: "email" | "sms") => {
    setRemindingId(invoiceId);
    try {
      const res = await api.post<{ message?: string }>(
        `/invoices/${invoiceId}/remind`,
        {
          channel,
        },
      );
      notify(res.data?.message || "Đã gửi nhắc nợ thành công.", "success");
      load();
    } catch (err: unknown) {
      const ax = err as {
        response?: { data?: { message?: string }; status?: number };
      };
      const message =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403
          ? "Bạn không có quyền gửi nhắc nợ."
          : "Gửi nhắc nợ thất bại.");
      notify(message, "error");
    } finally {
      setRemindingId(null);
    }
  };

  const load = async () => {
    if (role == null) {
      setInvoices([]);
      return;
    }
    try {
      if (role === "TENANT") {
        const res = await api.get("/invoices/me");
        setInvoices(res.data);
        setRooms([]);
        setTenants([]);
        return;
      }
      if (role === "ADMIN" || role === "STAFF") {
        const [iRes, rRes, tRes] = await Promise.all([
          api.get("/invoices"),
          api.get("/rooms"),
          api.get("/tenants"),
        ]);
        setInvoices(iRes.data);
        setRooms(rRes.data);
        setTenants(tRes.data);
        return;
      }
      setInvoices([]);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      const message =
        ax?.response?.status === 403
          ? "Bạn không có quyền xem danh sách hóa đơn"
          : "Tải dữ liệu hóa đơn thất bại";
      notify(message, "error");
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (filterStatus) {
      list = list.filter((i) => i.status === filterStatus);
    }
    if (filterRoomId) {
      list = list.filter((i) => String(i.room?.id) === filterRoomId);
    }
    return list;
  }, [invoices, filterStatus, filterRoomId]);

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
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            {isTenant
              ? "Hóa đơn của bạn theo kỳ (tháng/năm)."
              : "Danh sách hóa đơn theo phòng và kỳ. Dùng bộ lọc để tìm nhanh."}
          </p>
          {isAdmin && !isTenant && (
            <div
              className="form-grid"
              style={{ marginBottom: 16, maxWidth: 500 }}
            >
              <div>
                <label className="field-label">Lọc theo trạng thái</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="UNPAID">Chưa thanh toán</option>
                  <option value="PARTIAL">Thanh toán một phần</option>
                  <option value="PAID">Đã thanh toán</option>
                </select>
              </div>
              <div>
                <label className="field-label">Lọc theo phòng</label>
                <select
                  value={filterRoomId}
                  onChange={(e) => setFilterRoomId(e.target.value)}
                >
                  <option value="">Tất cả phòng</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <SimpleTable
            data={filteredInvoices}
            columns={[
              { header: "Phòng", render: (i: Invoice) => i.room?.code ?? "—" },
              {
                header: "Khách thuê",
                render: (i: Invoice) => i.tenant?.fullName ?? "—",
              },
              {
                header: "Kỳ",
                render: (i: Invoice) => `${i.month}/${i.year}`,
              },
              {
                header: "Tiền phòng",
                render: (i: Invoice) => formatMoney(i.roomCost),
              },
              {
                header: "Tiền điện",
                render: (i: Invoice) => formatMoney(i.electricityCost),
              },
              {
                header: "Tiền nước",
                render: (i: Invoice) => formatMoney(i.waterCost),
              },
              {
                header: "Tổng",
                render: (i: Invoice) => formatMoney(i.total),
              },
              {
                header: "Trạng thái",
                render: (i: Invoice) => (
                  <span
                    className={`status-badge ${invoiceStatusBadge(i.status)}`}
                  >
                    {invoiceStatusLabel(i.status)}
                  </span>
                ),
              },
              {
                header: "Đã nhắc nợ",
                render: (i: Invoice) => {
                  const emailAt = i.lastReminderEmailAt
                    ? formatReminderDate(i.lastReminderEmailAt)
                    : "";
                  const smsAt = i.lastReminderSmsAt
                    ? formatReminderDate(i.lastReminderSmsAt)
                    : "";
                  if (!emailAt && !smsAt) return "—";
                  const parts: string[] = [];
                  if (emailAt) parts.push(`Email ✓ ${emailAt}`);
                  if (smsAt) parts.push(`SMS ✓ ${smsAt}`);
                  return (
                    <span style={{ whiteSpace: "nowrap" }}>
                      {parts.join(" · ")}
                    </span>
                  );
                },
              },
              ...(canRemind
                ? [
                    {
                      header: "Nhắc nợ",
                      render: (i: Invoice) => {
                        const unpaid =
                          i.status === "UNPAID" || i.status === "PARTIAL";
                        const hasEmail = !!(
                          i.tenant?.email && String(i.tenant.email).trim()
                        );
                        const hasPhone = !!(
                          i.tenant?.phone && String(i.tenant.phone).trim()
                        );
                        const loading = remindingId === i.id;
                        return (
                          <span
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              disabled={!unpaid || !hasEmail || loading}
                              title={
                                !unpaid
                                  ? "Chỉ nhắc hóa đơn chưa thanh toán"
                                  : !hasEmail
                                    ? "Khách thuê chưa có email"
                                    : "Gửi nhắc nợ qua email"
                              }
                              onClick={() => sendReminder(i.id, "email")}
                            >
                              {loading ? "..." : "Email"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              disabled={!unpaid || !hasPhone || loading}
                              title={
                                !unpaid
                                  ? "Chỉ nhắc hóa đơn chưa thanh toán"
                                  : !hasPhone
                                    ? "Khách thuê chưa có SĐT"
                                    : "Gửi nhắc nợ qua SMS"
                              }
                              onClick={() => sendReminder(i.id, "sms")}
                            >
                              {loading ? "..." : "SMS"}
                            </button>
                          </span>
                        );
                      },
                    },
                  ]
                : []),
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
