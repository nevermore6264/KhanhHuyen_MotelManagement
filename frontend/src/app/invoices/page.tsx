"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

type Room = { id: number; code: string };
type Tenant = {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  idNumber?: string;
};
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
  reminderEmailCount?: number;
  reminderSmsCount?: number;
  lastReminderEmailMessage?: string | null;
  lastReminderSmsMessage?: string | null;
};

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(Number(n))) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

/** Nhãn khách thuê để phân biệt khi trùng tên: "Họ tên — SĐT" hoặc "Họ tên — CCCD" */
const tenantOptionLabel = (t: Tenant) => {
  const name = t.fullName || `Khách ${t.id}`;
  const extra = t.phone || t.idNumber;
  return extra ? `${name} — ${extra}` : name;
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
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRoomId, setFilterRoomId] = useState("");
  const [remindingId, setRemindingId] = useState<number | null>(null);
  const [viewReminderInvoice, setViewReminderInvoice] =
    useState<Invoice | null>(null);
  const [viewDetailInvoice, setViewDetailInvoice] = useState<Invoice | null>(
    null,
  );
  const [generating, setGenerating] = useState(false);
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

  const runGenerateInvoices = async () => {
    setGenerating(true);
    try {
      const res = await api.post<{ message?: string; created?: number }>(
        "/invoices/generate",
      );
      notify(res.data?.message ?? "Đã chạy sinh hóa đơn.", "success");
      load();
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const msg =
        ax?.response?.data?.message ||
        (ax?.response?.status === 403
          ? "Bạn không có quyền thao tác."
          : "Sinh hóa đơn thất bại.");
      notify(msg, "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Hóa đơn</h2>
        <div className="card">
          <div>
            <h3>Danh sách hóa đơn</h3>
            <p className="card-subtitle">Theo dõi thanh toán theo kỳ.</p>
          </div>
          {!isTenant && (
            <div className="invoice-job-note">
              <span>
                Hóa đơn được <strong>sinh tự động</strong> bởi hệ thống (job
                chạy đầu mỗi tháng) theo hợp đồng đang active và số điện nước.
                Nhập chỉ số điện nước tại mục <strong>Điện nước</strong>, hệ
                thống sẽ cập nhật tiền vào hóa đơn tương ứng.
              </span>
              {(isAdmin || role === "STAFF") && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={runGenerateInvoices}
                  disabled={generating}
                >
                  {generating ? "Đang sinh…" : "Sinh hóa đơn ngay"}
                </button>
              )}
            </div>
          )}
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
                header: "Tổng",
                render: (i: Invoice) => (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {formatMoney(i.total)}
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      style={{ padding: "2px 8px" }}
                      onClick={() => setViewDetailInvoice(i)}
                      title="Xem chi tiết các khoản"
                    >
                      Xem chi tiết
                    </button>
                  </span>
                ),
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
                  const emailCount = i.reminderEmailCount ?? 0;
                  const smsCount = i.reminderSmsCount ?? 0;
                  const hasAny =
                    emailAt || smsAt || emailCount > 0 || smsCount > 0;
                  if (!hasAny) return "—";
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        gap: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      {emailAt && (
                        <span style={{ whiteSpace: "nowrap" }}>
                          Email: lần {emailCount || 1} ({emailAt})
                        </span>
                      )}
                      {smsAt && (
                        <span style={{ whiteSpace: "nowrap" }}>
                          SMS: lần {smsCount || 1} ({smsAt})
                        </span>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        style={{ marginTop: 4, padding: "2px 8px" }}
                        onClick={() => setViewReminderInvoice(i)}
                      >
                        Xem nội dung đã gửi
                      </button>
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

        {viewDetailInvoice && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Chi tiết các khoản</h3>
                  <p className="card-subtitle">
                    Hóa đơn phòng {viewDetailInvoice.room?.code} —{" "}
                    {viewDetailInvoice.month}/{viewDetailInvoice.year}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>Tiền phòng</span>
                  <strong>{formatMoney(viewDetailInvoice.roomCost)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>Tiền điện</span>
                  <strong>
                    {formatMoney(viewDetailInvoice.electricityCost)}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>Tiền nước</span>
                  <strong>{formatMoney(viewDetailInvoice.waterCost)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0 0",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#102a5c",
                  }}
                >
                  <span>Tổng</span>
                  <strong>{formatMoney(viewDetailInvoice.total)}</strong>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewDetailInvoice(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {viewReminderInvoice && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Nội dung nhắc nợ đã gửi</h3>
                  <p className="card-subtitle">
                    Hóa đơn phòng {viewReminderInvoice.room?.code} —{" "}
                    {viewReminderInvoice.month}/{viewReminderInvoice.year}
                  </p>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {viewReminderInvoice.lastReminderEmailAt && (
                  <div>
                    <div className="field-label" style={{ marginBottom: 6 }}>
                      Email — lần thứ{" "}
                      {viewReminderInvoice.reminderEmailCount ?? 1} (gửi{" "}
                      {formatReminderDate(
                        viewReminderInvoice.lastReminderEmailAt,
                      )}
                      )
                    </div>
                    <div
                      className="readonly-field"
                      style={{
                        whiteSpace: "pre-wrap",
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      {viewReminderInvoice.lastReminderEmailMessage?.trim() ||
                        "Không lưu nội dung."}
                    </div>
                  </div>
                )}
                {viewReminderInvoice.lastReminderSmsAt && (
                  <div>
                    <div className="field-label" style={{ marginBottom: 6 }}>
                      SMS — lần thứ {viewReminderInvoice.reminderSmsCount ?? 1}{" "}
                      (gửi{" "}
                      {formatReminderDate(
                        viewReminderInvoice.lastReminderSmsAt,
                      )}
                      )
                    </div>
                    <div
                      className="readonly-field"
                      style={{
                        whiteSpace: "pre-wrap",
                        maxHeight: 120,
                        overflowY: "auto",
                      }}
                    >
                      {viewReminderInvoice.lastReminderSmsMessage?.trim() ||
                        "Không lưu nội dung."}
                    </div>
                  </div>
                )}
                {!viewReminderInvoice.lastReminderEmailAt &&
                  !viewReminderInvoice.lastReminderSmsAt && (
                    <p className="card-subtitle">
                      Chưa có lịch sử nhắc nợ (dữ liệu cũ).
                    </p>
                  )}
              </div>
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewReminderInvoice(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
