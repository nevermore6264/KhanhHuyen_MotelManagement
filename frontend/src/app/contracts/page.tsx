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
type Contract = {
  id: number;
  room?: Room;
  tenant?: Tenant;
  startDate?: string;
  endDate?: string;
  status?: string;
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

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roomId, setRoomId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [rent, setRent] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [extendId, setExtendId] = useState<number | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [confirmEndId, setConfirmEndId] = useState<number | null>(null);
  const role = getRole();
  const isAdmin = role === "ADMIN";
  const isTenant = role === "TENANT";
  const { notify } = useToast();

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
    load();
  }, []);

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
    if (deposit && Number(deposit) < 0) {
      setError("Tiền cọc không hợp lệ");
      return;
    }
    if (rent && Number(rent) < 0) {
      setError("Giá thuê không hợp lệ");
      return;
    }
    setError("");
    try {
      await api.post("/contracts", {
        room: roomId ? { id: Number(roomId) } : null,
        tenant: tenantId ? { id: Number(tenantId) } : null,
        startDate,
        endDate,
        deposit: deposit ? Number(deposit) : null,
        rent: rent ? Number(rent) : null,
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

  const downloadContractDoc = (contract: Contract) => {
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Hợp đồng thuê phòng</title>
  <style>
    body { font-family: "Times New Roman", serif; line-height: 1.6; }
    h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
    .meta { text-align: center; font-size: 12px; margin-bottom: 16px; }
    .section { margin: 12px 0; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <h1>HỢP ĐỒNG THUÊ PHÒNG</h1>
  <div class="meta">Mã hợp đồng: ${contract.id || ""}</div>
  <div class="section">
    <div><span class="label">Phòng:</span> ${contract.room?.code || ""}</div>
    <div><span class="label">Khách thuê:</span> ${contract.tenant?.fullName || ""}</div>
  </div>
  <div class="section">
    <div><span class="label">Ngày bắt đầu:</span> ${contract.startDate || ""}</div>
    <div><span class="label">Ngày kết thúc:</span> ${contract.endDate || ""}</div>
    <div><span class="label">Trạng thái:</span> ${contractStatusLabel(contract.status)}</div>
  </div>
  <div class="section">
    <div class="label">Điều khoản cơ bản</div>
    <div>- Bên thuê cam kết thanh toán đúng hạn.</div>
    <div>- Bên cho thuê đảm bảo phòng ở đúng thông tin đã thỏa thuận.</div>
  </div>
  <div class="section">
    <div>Đại diện bên cho thuê ______________________</div>
    <div>Đại diện bên thuê ______________________</div>
  </div>
</body>
</html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hop-dong-${contract.id || "phong"}.doc`;
    a.click();
    URL.revokeObjectURL(url);
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
              { header: "Bắt đầu", render: (c) => c.startDate },
              { header: "Kết thúc", render: (c) => c.endDate },
              {
                header: "Trạng thái",
                render: (c) => contractStatusLabel(c.status),
              },
              {
                header: "Tải file",
                render: (c: Contract) => (
                  <button
                    className="btn btn-secondary"
                    onClick={() => downloadContractDoc(c)}
                  >
                    Tải Word
                  </button>
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

        {showCreate && isAdmin && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Tạo hợp đồng</h3>
                  <p className="card-subtitle">Chọn phòng và khách thuê</p>
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
                    Ngày kết thúc <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Tiền cọc</label>
                  <input
                    placeholder="Tiền cọc"
                    inputMode="numeric"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Giá thuê</label>
                  <input
                    placeholder="Giá thuê"
                    inputMode="numeric"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                  />
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
