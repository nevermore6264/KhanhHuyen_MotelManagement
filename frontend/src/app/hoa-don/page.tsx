"use client";

import { useEffect, useMemo, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconTimes, IconEye, IconRefresh, IconPlus } from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import type { Invoice, RawJson, Room, Tenant } from "@/lib/mapHoaDonApi";
import {
  chuanHoaKhachThueTuApi,
  chuanHoaPhongTuApi,
  khachCuaHoaDon,
  mapHoaDonFromApi,
} from "@/lib/mapHoaDonApi";

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(Number(n))) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

const formatChiSo = (n?: number) =>
  n != null && Number.isFinite(n)
    ? new Intl.NumberFormat("vi-VN").format(n)
    : "—";

/** Nhập số tiền (cùng cách `/phong`, `/thanh-toan`). */
const dinhDangNhapTien = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
};

const parseNhapTien = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
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

export default function TrangHoaDon() {
  const [mounted, setMounted] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRoomId, setFilterRoomId] = useState("");
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [viewReminderInvoice, setViewReminderInvoice] =
    useState<Invoice | null>(null);
  const [viewDetailInvoice, setViewDetailInvoice] = useState<Invoice | null>(
    null,
  );
  const [dongChinhSuaChiTiet, setDongChinhSuaChiTiet] = useState<
    { tenKhoan: string; soTien: string }[]
  >([]);
  const [dangLuuChiTiet, setDangLuuChiTiet] = useState(false);
  const [generating, setGenerating] = useState(false);
  const role = mounted ? getRole() : null;
  const isTenant = role === "TENANT";
  const isAdmin = role === "ADMIN";
  const canRemind = (isAdmin || role === "STAFF") && !isTenant;
  const canSuaChiTiet = (isAdmin || role === "STAFF") && !isTenant;
  const { notify } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sendReminder = async (invoiceId: string) => {
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
        setInvoices(mangHd.map((x) => mapHoaDonFromApi(x as RawJson)));
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
        setInvoices(mangHd.map((x) => mapHoaDonFromApi(x as RawJson)));
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

  const khoiTaoDongChiTietTuHoaDon = (i: Invoice) => {
    const co = i.lineItems && i.lineItems.length > 0;
    setDongChinhSuaChiTiet(
      co
        ? i.lineItems!.map((l) => ({
            tenKhoan: l.tenKhoan,
            soTien: dinhDangNhapTien(
              String(
                l.soTien != null && !Number.isNaN(Number(l.soTien))
                  ? Math.round(Number(l.soTien))
                  : 0,
              ),
            ),
          }))
        : [{ tenKhoan: "", soTien: "" }],
    );
  };

  const luuChiTietHoaDon = async () => {
    if (!viewDetailInvoice || !canSuaChiTiet) return;
    setDangLuuChiTiet(true);
    try {
      await api.put(`/hoa-don/${viewDetailInvoice.id}/chi-tiet`, {
        dong: dongChinhSuaChiTiet
          .filter((r) => r.tenKhoan.trim())
          .map((r) => ({
            tenKhoan: r.tenKhoan.trim(),
            soTien: parseNhapTien(r.soTien) ?? 0,
          })),
      });
      notify("Đã lưu chi tiết hóa đơn.", "success");
      await load();
      setViewDetailInvoice(null);
    } catch {
      notify("Lưu chi tiết thất bại.", "error");
    } finally {
      setDangLuuChiTiet(false);
    }
  };

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
                      onClick={() => {
                        setViewDetailInvoice(i);
                        khoiTaoDongChiTietTuHoaDon(i);
                      }}
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
                  <span>Số điện cũ</span>
                  <strong>{formatChiSo(viewDetailInvoice.electricOld)}</strong>
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
                  <span>Số điện mới</span>
                  <strong>{formatChiSo(viewDetailInvoice.electricNew)}</strong>
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
                  <span>Số nước cũ</span>
                  <strong>{formatChiSo(viewDetailInvoice.waterOld)}</strong>
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
                  <span>Số nước mới</span>
                  <strong>{formatChiSo(viewDetailInvoice.waterNew)}</strong>
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
                {viewDetailInvoice.lineItems &&
                  viewDetailInvoice.lineItems.length > 0 &&
                  viewDetailInvoice.lineItems.map((l) => (
                    <div
                      key={l.id ?? `${l.tenKhoan}-${l.soTien}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <span>{l.tenKhoan}</span>
                      <strong>{formatMoney(l.soTien)}</strong>
                    </div>
                  ))}
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
              {canSuaChiTiet && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: "1rem" }}>
                    Chỉnh sửa các khoản thêm
                  </h4>
                  <p
                    className="card-subtitle"
                    style={{ marginBottom: 10, fontSize: "0.85rem" }}
                  >
                    Thêm dòng (giữ xe, wifi, sửa chữa…). Lưu sẽ thay toàn bộ
                    danh sách phụ trên hóa đơn.
                  </p>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.9rem",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ textAlign: "left", padding: "6px 4px" }}>
                          Tên khoản
                        </th>
                        <th style={{ textAlign: "left", padding: "6px 4px" }}>
                          Số tiền
                        </th>
                        <th style={{ width: 72 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {dongChinhSuaChiTiet.map((row, idx) => (
                        <tr
                          key={idx}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td style={{ padding: "6px 4px" }}>
                            <input
                              style={{ width: "100%" }}
                              value={row.tenKhoan}
                              onChange={(e) => {
                                const v = e.target.value;
                                setDongChinhSuaChiTiet((prev) =>
                                  prev.map((r, i) =>
                                    i === idx ? { ...r, tenKhoan: v } : r,
                                  ),
                                );
                              }}
                              placeholder="VD: Tiền giữ xe"
                            />
                          </td>
                          <td style={{ padding: "6px 4px", minWidth: 160 }}>
                            <div className="input-suffix">
                              <input
                                placeholder="Ví dụ: 100.000"
                                inputMode="numeric"
                                autoComplete="off"
                                style={{ width: "100%", minWidth: 0 }}
                                value={row.soTien}
                                onChange={(e) => {
                                  const v = dinhDangNhapTien(e.target.value);
                                  setDongChinhSuaChiTiet((prev) =>
                                    prev.map((r, i) =>
                                      i === idx ? { ...r, soTien: v } : r,
                                    ),
                                  );
                                }}
                              />
                              <span>VNĐ</span>
                            </div>
                          </td>
                          <td style={{ padding: "6px 4px" }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              disabled={dongChinhSuaChiTiet.length <= 1}
                              onClick={() =>
                                setDongChinhSuaChiTiet((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() =>
                      setDongChinhSuaChiTiet((prev) => [
                        ...prev,
                        { tenKhoan: "", soTien: "" },
                      ])
                    }
                  >
                    <IconPlus /> Thêm dòng
                  </button>
                </div>
              )}
              <div className="modal-actions" style={{ marginTop: 16 }}>
                {canSuaChiTiet && (
                  <button
                    type="button"
                    className="btn"
                    disabled={dangLuuChiTiet}
                    onClick={() => void luuChiTietHoaDon()}
                  >
                    {dangLuuChiTiet ? "Đang lưu…" : "Lưu chi tiết"}
                  </button>
                )}
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
