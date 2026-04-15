"use client";

import { useEffect, useMemo, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconTimes, IconEye, IconRefresh } from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";

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
  /** Khách đại diện trên hóa đơn (API: khachThue). */
  tenant?: Tenant;
  /** Tất cả khách theo hợp đồng active của phòng (API: danhSachKhachThue). */
  tenants?: Tenant[];
  month: number;
  year: number;
  roomCost?: number;
  electricityCost?: number;
  waterCost?: number;
  total?: number;
  status?: string;
  lastReminderEmailAt?: string | null;
  reminderEmailCount?: number;
  lastReminderEmailMessage?: string | null;
};

type RawJson = Record<string, unknown>;

function soTienTuApi(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/\s/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Jackson có thể trả LocalDateTime dạng chuỗi ISO hoặc mảng [y,M,d,h,m,s]. */
function ngayRaChuoiIso(v: unknown): string | null | undefined {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length >= 3) {
    const y = Number(v[0]);
    const M = Number(v[1]) || 1;
    const d = Number(v[2]) || 1;
    const h = Number(v[3]) || 0;
    const m = Number(v[4]) || 0;
    const s = Number(v[5]) || 0;
    if (!y) return undefined;
    return new Date(y, M - 1, d, h, m, s).toISOString();
  }
  return undefined;
}

function chuanHoaPhongTuApi(raw: RawJson): Room {
  return {
    id: Number(raw.id),
    code: String(raw.maPhong ?? raw.ma_phong ?? raw.code ?? "").trim(),
  };
}

function chuanHoaKhachThueTuApi(raw: RawJson): Tenant {
  return {
    id: Number(raw.id),
    fullName: String(raw.hoTen ?? raw.fullName ?? "").trim(),
    email: raw.email != null ? String(raw.email) : undefined,
    phone:
      raw.soDienThoai != null
        ? String(raw.soDienThoai)
        : raw.phone != null
          ? String(raw.phone)
          : undefined,
    idNumber:
      raw.soGiayTo != null
        ? String(raw.soGiayTo)
        : raw.idNumber != null
          ? String(raw.idNumber)
          : undefined,
  };
}

function chuanHoaHoaDonTuApi(raw: RawJson): Invoice {
  const phongRaw = raw.phong ?? raw.room;
  const khachRaw = raw.khachThue ?? raw.tenant;
  const dsKhachRaw = raw.danhSachKhachThue;
  const tt = raw.trangThai ?? raw.status;
  let status = "";
  if (typeof tt === "string") status = tt;
  else if (tt && typeof tt === "object" && "name" in tt) {
    status = String((tt as { name?: string }).name ?? "");
  } else if (tt != null) status = String(tt);

  let tenants: Tenant[] | undefined;
  if (Array.isArray(dsKhachRaw)) {
    tenants = dsKhachRaw
      .filter((x) => x && typeof x === "object")
      .map((x) => chuanHoaKhachThueTuApi(x as RawJson));
    if (tenants.length === 0) tenants = undefined;
  }

  return {
    id: Number(raw.id),
    room:
      phongRaw && typeof phongRaw === "object"
        ? chuanHoaPhongTuApi(phongRaw as RawJson)
        : undefined,
    tenant:
      khachRaw && typeof khachRaw === "object"
        ? chuanHoaKhachThueTuApi(khachRaw as RawJson)
        : undefined,
    tenants,
    month: Number(raw.thang ?? raw.month ?? 0),
    year: Number(raw.nam ?? raw.year ?? 0),
    roomCost: soTienTuApi(raw.tienPhong ?? raw.roomCost),
    electricityCost: soTienTuApi(raw.tienDien ?? raw.electricityCost),
    waterCost: soTienTuApi(raw.tienNuoc ?? raw.waterCost),
    total: soTienTuApi(raw.tongTien ?? raw.total),
    status: status || undefined,
    lastReminderEmailAt: (() => {
      const iso = ngayRaChuoiIso(raw.nhacNoEmailLanCuoi);
      if (iso) return iso;
      if (raw.lastReminderEmailAt != null)
        return String(raw.lastReminderEmailAt);
      return null;
    })(),
    reminderEmailCount: Number(
      raw.soLanNhacNoEmail ?? raw.reminderEmailCount ?? 0,
    ),
    lastReminderEmailMessage:
      raw.noiDungEmailCuoi != null
        ? String(raw.noiDungEmailCuoi)
        : raw.lastReminderEmailMessage != null
          ? String(raw.lastReminderEmailMessage)
          : null,
  };
}

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

/** Khách hiển thị / nhắc nợ: ưu tiên danh sách hợp đồng, không thì khách trên hóa đơn. */
function khachCuaHoaDon(i: Invoice): Tenant[] {
  if (i.tenants && i.tenants.length > 0) return i.tenants;
  if (i.tenant) return [i.tenant];
  return [];
}

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

export default function TrangHoaDon() {
  const [mounted, setMounted] = useState(false);
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
  const role = mounted ? getRole() : null;
  const isTenant = role === "TENANT";
  const isAdmin = role === "ADMIN";
  const canRemind = (isAdmin || role === "STAFF") && !isTenant;
  const { notify } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sendReminder = async (invoiceId: number) => {
    setRemindingId(invoiceId);
    try {
      const res = await api.post<{ message?: string }>(
        `/hoa-don/${invoiceId}/nhac-no`,
        {
          channel: "email",
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
        const res = await api.get("/hoa-don/cua-toi");
        const mangHd = Array.isArray(res.data) ? res.data : [];
        setInvoices(mangHd.map((x) => chuanHoaHoaDonTuApi(x as RawJson)));
        setRooms([]);
        setTenants([]);
        return;
      }
      if (role === "ADMIN" || role === "STAFF") {
        const [iRes, rRes, tRes] = await Promise.all([
          api.get("/hoa-don"),
          api.get("/phong"),
          api.get("/khach-thue"),
        ]);
        const mangHd = Array.isArray(iRes.data) ? iRes.data : [];
        const mangPhong = Array.isArray(rRes.data) ? rRes.data : [];
        const mangKhach = Array.isArray(tRes.data) ? tRes.data : [];
        setInvoices(mangHd.map((x) => chuanHoaHoaDonTuApi(x as RawJson)));
        setRooms(mangPhong.map((x) => chuanHoaPhongTuApi(x as RawJson)));
        setTenants(mangKhach.map((x) => chuanHoaKhachThueTuApi(x as RawJson)));
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
    if (mounted) load();
  }, [mounted, role]);

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
        "/hoa-don/sinh",
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
    <TrangBaoVe>
      <ThanhDieuHuong />
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
              {mounted && (isAdmin || role === "STAFF") && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={runGenerateInvoices}
                  disabled={generating}
                >
                  {generating ? (
                    "Đang sinh…"
                  ) : (
                    <>
                      <IconRefresh /> Sinh hóa đơn ngay
                    </>
                  )}
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
          <BangDonGian
            data={filteredInvoices}
            columns={[
              { header: "Phòng", render: (i: Invoice) => i.room?.code ?? "—" },
              {
                header: "Khách thuê",
                render: (i: Invoice) => {
                  const list = khachCuaHoaDon(i);
                  if (!list.length) {
                    return (
                      <span className="text-muted" title="Hóa đơn không gắn hợp đồng active trong kỳ, hoặc phòng chưa có khách đại diện.">
                        Chưa có khách trong kỳ
                      </span>
                    );
                  }
                  if (list.length === 1) {
                    return list[0].fullName?.trim() || "—";
                  }
                  return (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        textAlign: "left",
                      }}
                    >
                      {list.map((t) => (
                        <li key={t.id}>
                          {t.fullName?.trim() || `Khách ${t.id}`}
                        </li>
                      ))}
                    </ul>
                  );
                },
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
                      <IconEye /> Xem chi tiết
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
                  const emailCount = i.reminderEmailCount ?? 0;
                  const hasAny = emailAt || emailCount > 0;
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
                        const ds = khachCuaHoaDon(i);
                        const hasEmail = ds.some(
                          (t) => t.email && String(t.email).trim(),
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
                              onClick={() => sendReminder(i.id)}
                            >
                              {loading ? "..." : "Email"}
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
                  <IconTimes /> Đóng
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
                {!viewReminderInvoice.lastReminderEmailAt && (
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
                  <IconTimes /> Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
