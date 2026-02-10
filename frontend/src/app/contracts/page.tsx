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
  const { notify } = useToast();

  const load = async () => {
    const [cRes, rRes, tRes] = await Promise.all([
      api.get("/contracts"),
      api.get("/rooms"),
      api.get("/tenants"),
    ]);
    setContracts(cRes.data);
    setRooms(rRes.data);
    setTenants(tRes.data);
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
              Bạn chỉ có quyền xem dữ liệu.
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
                  <label className="field-label">Phòng</label>
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
                  <label className="field-label">Khách thuê</label>
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
                  <label className="field-label">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Ngày kết thúc</label>
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
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Giá thuê</label>
                  <input
                    placeholder="Giá thuê"
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
