"use client";

import { useEffect, useRef, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";
import { buildContractDocx } from "@/lib/contractDocx";
import { renderAsync } from "docx-preview";

type Room = {
  id: number;
  code: string;
  currentPrice?: number;
  status?: string;
};
type Tenant = {
  id: number;
  fullName: string;
  phone?: string;
  idNumber?: string;
  address?: string;
  email?: string;
};
type Contract = {
  id: number;
  room?: Room;
  tenant?: Tenant;
  startDate?: string;
  endDate?: string;
  status?: string;
  deposit?: number;
  rent?: number;
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

const contractStatusBadge = (value?: string) => {
  switch (value) {
    case "ACTIVE":
      return "status-available";
    case "ENDED":
      return "status-maintenance";
    case "TERMINATED":
      return "status-occupied";
    default:
      return "status-unknown";
  }
};

/** Định dạng ngày thành dd/MM/yyyy */
const formatDateDMY = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/** Định dạng tiền cho in hợp đồng (1.000.000 VNĐ) */
const formatMoneyDoc = (n?: number | null) => {
  if (n == null || isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(n))} VNĐ`;
};

const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
};

const parseCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
};

/** Nhãn khách thuê để phân biệt khi trùng tên: "Họ tên — SĐT" hoặc "Họ tên — CCCD" */
const tenantOptionLabel = (t: Tenant) => {
  const name = t.fullName || `Khách ${t.id}`;
  const extra = t.phone || t.idNumber;
  return extra ? `${name} — ${extra}` : name;
};

/** Tính ngày kết thúc = ngày bắt đầu + N tháng, trừ 1 ngày (hết hạn vào ngày cuối) */
const addMonthsToDate = (startYMD: string, months: number): string => {
  if (!startYMD || months < 1) return "";
  const d = new Date(startYMD + "T12:00:00");
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roomId, setRoomId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState<"" | "6" | "12" | "24">(
    "",
  );
  const [endDate, setEndDate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [rent, setRent] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [extendId, setExtendId] = useState<number | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [confirmEndId, setConfirmEndId] = useState<number | null>(null);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<string | null>(null);
  const isAdmin = role === "ADMIN";
  const isTenant = role === "TENANT";
  const { notify } = useToast();

  useEffect(() => {
    setRole(getRole());
  }, []);

  const load = async () => {
    try {
      if (isTenant) {
        const res = await api.get("/contracts/me");
        setContracts(res.data);
        setRooms([]);
        setTenants([]);
        return;
      }
      const [cRes, rRes, tRes] = await Promise.all([
        api.get("/contracts"),
        api.get("/rooms"),
        api.get("/tenants"),
      ]);
      setContracts(cRes.data);
      setRooms(rRes.data);
      setTenants(tRes.data);
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền xem danh sách hợp đồng"
          : "Tải dữ liệu hợp đồng thất bại";
      notify(message, "error");
    }
  };

  useEffect(() => {
    if (role !== null) load();
  }, [role]);

  useEffect(() => {
    if (!showCreate) return;
    const months = durationMonths === "" ? 0 : Number(durationMonths);
    if (months >= 1 && startDate) {
      setEndDate(addMonthsToDate(startDate, months));
    }
  }, [showCreate, startDate, durationMonths]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !tenantId) {
      setError("Vui lòng chọn phòng và khách thuê");
      return;
    }
    if (!startDate) {
      setError("Vui lòng chọn ngày bắt đầu");
      return;
    }
    if (!endDate) {
      setError("Vui lòng chọn ngày kết thúc");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }
    const selectedRoom = rooms.find((r) => Number(roomId) === r.id);
    const rentValue =
      parseCurrencyInput(rent) ?? selectedRoom?.currentPrice ?? null;
    if (rentValue != null && rentValue < 0) {
      setError("Giá thuê không hợp lệ");
      return;
    }
    const depositValue = parseCurrencyInput(deposit);
    if (depositValue != null && depositValue < 0) {
      setError("Tiền cọc không hợp lệ");
      return;
    }
    setError("");
    try {
      await api.post("/contracts", {
        room: roomId ? { id: Number(roomId) } : null,
        tenant: tenantId ? { id: Number(tenantId) } : null,
        startDate,
        endDate,
        deposit: depositValue,
        rent: rentValue,
      });
      notify("Tạo hợp đồng thành công", "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Tạo hợp đồng thất bại";
      setError(message);
      notify(message, "error");
      return;
    }
    setRoomId("");
    setTenantId("");
    setStartDate("");
    setDurationMonths("");
    setEndDate("");
    setDeposit("");
    setRent("");
    setShowCreate(false);
    load();
  };

  const filtered = contracts.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.room?.code?.toLowerCase().includes(q) ||
      c.tenant?.fullName?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  });

  /** Khách thuê đang có hợp đồng ACTIVE thì không cho chọn khi tạo hợp đồng mới */
  const tenantIdsWithActiveContract = new Set(
    contracts
      .filter((c) => c.status === "ACTIVE")
      .map((c) => c.tenant?.id)
      .filter((id): id is number => id != null),
  );
  const availableTenantsForNewContract = tenants.filter(
    (t) => !tenantIdsWithActiveContract.has(t.id),
  );

  const openExtend = (contract: Contract) => {
    setExtendId(contract.id);
    setExtendDate(contract.endDate || "");
  };

  const saveExtend = async () => {
    if (!extendId || !extendDate) return;
    try {
      await api.put(`/contracts/${extendId}/extend`, { endDate: extendDate });
      notify("Gia hạn hợp đồng thành công", "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Gia hạn thất bại";
      setError(message);
      notify(message, "error");
      return;
    }
    setExtendId(null);
    setExtendDate("");
    load();
  };

  const cancelExtend = () => {
    setExtendId(null);
    setExtendDate("");
  };

  const confirmEnd = (contract: Contract) => {
    setConfirmEndId(contract.id);
  };

  const endContract = async () => {
    if (!confirmEndId) return;
    try {
      await api.put(`/contracts/${confirmEndId}/end`);
      notify("Kết thúc hợp đồng thành công", "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Kết thúc thất bại";
      setError(message);
      notify(message, "error");
      return;
    }
    setConfirmEndId(null);
    load();
  };

  const cancelEnd = () => {
    setConfirmEndId(null);
  };

  const viewContractDoc = (contract: Contract) => {
    setPreviewContract(contract);
  };

  useEffect(() => {
    if (!previewContract || !previewContainerRef.current) return;
    const el = previewContainerRef.current;
    setPreviewLoading(true);
    el.innerHTML = "";
    buildContractDocx(previewContract)
      .then((blob) => renderAsync(blob, el))
      .then(() => setPreviewLoading(false))
      .catch(() => setPreviewLoading(false));
  }, [previewContract?.id]);

  const downloadContractDoc = async (contract: Contract) => {
    try {
      const blob = await buildContractDocx(contract);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hop-dong-thue-nha-tro-${contract.room?.code || contract.id || "phong"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notify("Tải file thất bại", "error");
    }
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Quản lý hợp đồng</h2>
        <div className="card">
          <div className="grid grid-2">
            <input
              placeholder="Tìm kiếm theo phòng, khách, trạng thái..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(true)}>
                  Tạo hợp đồng
                </button>
              </div>
            )}
          </div>
          {!isAdmin && (
            <div className="form-error" style={{ marginTop: 12 }}>
              {isTenant
                ? "Bạn chỉ có thể xem hợp đồng của chính mình."
                : "Bạn chỉ có quyền xem dữ liệu."}
            </div>
          )}
        </div>
        <div className="card">
          <SimpleTable
            data={filtered}
            columns={[
              { header: "ID", render: (c) => c.id },
              { header: "Phòng", render: (c) => c.room?.code },
              { header: "Khách", render: (c) => c.tenant?.fullName },
              { header: "Bắt đầu", render: (c) => formatDateDMY(c.startDate) },
              { header: "Kết thúc", render: (c) => formatDateDMY(c.endDate) },
              {
                header: "Trạng thái",
                render: (c) => (
                  <span
                    className={`status-badge ${contractStatusBadge(c.status)}`}
                  >
                    {contractStatusLabel(c.status)}
                  </span>
                ),
              },
              {
                header: "Hợp đồng",
                render: (c: Contract) => (
                  <div className="table-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => viewContractDoc(c)}
                      title="Xem nội dung hợp đồng"
                    >
                      Xem
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => downloadContractDoc(c)}
                      title="Tải file Word"
                    >
                      Tải Word
                    </button>
                  </div>
                ),
              },
              ...(isAdmin
                ? [
                    {
                      header: "Thao tác",
                      render: (c: Contract) => (
                        <div className="table-actions">
                          <button className="btn" onClick={() => openExtend(c)}>
                            Gia hạn
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => confirmEnd(c)}
                          >
                            Kết thúc
                          </button>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {previewContract && (
          <div className="modal-backdrop">
            <div
              className="modal-card"
              style={{
                position: "relative",
                maxWidth: "90vw",
                width: 800,
                maxHeight: "calc(90vh - 48px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  flexShrink: 0,
                  paddingRight: 8,
                }}
              >
                <h3 style={{ margin: 0 }}>
                  Xem hợp đồng — Phòng {previewContract.room?.code}
                </h3>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setPreviewContract(null);
                    setPreviewLoading(false);
                  }}
                  style={{ flexShrink: 0 }}
                >
                  Đóng
                </button>
              </div>
              <div
                ref={previewContainerRef}
                style={{
                  flex: 1,
                  overflow: "auto",
                  minHeight: 400,
                  padding: 16,
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: 8,
                }}
              />
              {previewLoading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: 8,
                  }}
                >
                  Đang tải...
                </div>
              )}
            </div>
          </div>
        )}

        {showCreate && isAdmin && (
          <div className="modal-backdrop">
            <div className="modal-card form-card contract-create-modal">
              <div className="card-header">
                <div>
                  <h3>Tạo hợp đồng</h3>
                  <p className="card-subtitle">
                    Chọn phòng, khách thuê và điền thông tin hợp đồng
                  </p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div className="form-section form-span-2">
                  <h4 className="form-section-title">Phòng &amp; Khách thuê</h4>
                  <div className="form-section-fields">
                    <div>
                      <label className="field-label">
                        Phòng <span className="required">*</span>
                      </label>
                      <select
                        value={roomId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setRoomId(id);
                          const room = rooms.find((r) => Number(id) === r.id);
                          setRent(
                            room?.currentPrice != null
                              ? formatCurrencyInput(String(room.currentPrice))
                              : "",
                          );
                        }}
                      >
                        <option value="">Chọn phòng</option>
                        {rooms
                          .filter((r) => r.status === "AVAILABLE")
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.code}
                            </option>
                          ))}
                      </select>
                      {rooms.filter((r) => r.status === "AVAILABLE").length ===
                        0 && (
                        <p className="card-subtitle" style={{ marginTop: 4 }}>
                          Không có phòng trống.
                        </p>
                      )}
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
                        {availableTenantsForNewContract.map((t) => (
                          <option key={t.id} value={t.id}>
                            {tenantOptionLabel(t)}
                          </option>
                        ))}
                      </select>
                      {availableTenantsForNewContract.length === 0 && (
                        <p className="card-subtitle" style={{ marginTop: 4 }}>
                          Tất cả khách thuê đều đang có hợp đồng hiệu lực.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section form-span-2">
                  <h4 className="form-section-title">Thời hạn hợp đồng</h4>
                  <div className="form-section-fields">
                    <div>
                      <label className="field-label">
                        Ngày bắt đầu <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">
                        Khoảng thời gian thuê
                      </label>
                      <select
                        value={durationMonths}
                        onChange={(e) =>
                          setDurationMonths(
                            (e.target.value || "") as "" | "6" | "12" | "24",
                          )
                        }
                      >
                        <option value="">
                          Tùy chọn (tự nhập ngày kết thúc)
                        </option>
                        <option value="6">6 tháng</option>
                        <option value="12">1 năm</option>
                        <option value="24">2 năm</option>
                      </select>
                    </div>
                    <div className="form-section-full">
                      <label className="field-label">
                        Ngày kết thúc <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          if (durationMonths) setDurationMonths("");
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section form-span-2">
                  <h4 className="form-section-title">Tài chính</h4>
                  <div className="form-section-fields">
                    <div>
                      <label className="field-label">Tiền cọc</label>
                      <div className="input-suffix">
                        <input
                          placeholder="Ví dụ: 1.000.000"
                          value={deposit}
                          onChange={(e) =>
                            setDeposit(formatCurrencyInput(e.target.value))
                          }
                        />
                        <span>VNĐ</span>
                      </div>
                    </div>
                    <div>
                      <label className="field-label">Giá thuê</label>
                      <div className="input-suffix">
                        <input
                          placeholder="Chọn phòng để lấy giá"
                          value={rent}
                          readOnly
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            cursor: "not-allowed",
                          }}
                        />
                        <span>VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className="form-error form-span-2">{error}</div>}
                <div className="form-actions form-span-2">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setShowCreate(false)}
                  >
                    Hủy
                  </button>
                  <button className="btn btn-primary" type="submit">
                    Tạo hợp đồng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {extendId != null && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>Gia hạn hợp đồng</h3>
              <div className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">Ngày kết thúc mới</label>
                  <input
                    type="date"
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelExtend}>
                  Hủy
                </button>
                <button className="btn" onClick={saveExtend}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmEndId != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Kết thúc hợp đồng</h3>
              <p>Bạn có chắc muốn kết thúc hợp đồng này?</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelEnd}>
                  Hủy
                </button>
                <button className="btn" onClick={endContract}>
                  Kết thúc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
