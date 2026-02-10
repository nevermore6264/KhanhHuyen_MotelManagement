"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

type Area = { id: number; name: string };
type Room = {
  id: number;
  code: string;
  floor?: string;
  status: string;
  area?: Area;
  currentPrice?: number;
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

const statusLabel = (value?: string) => {
  switch (value) {
    case "AVAILABLE":
      return "Trống";
    case "OCCUPIED":
      return "Đang thuê";
    case "MAINTENANCE":
      return "Bảo trì";
    default:
      return value || "-";
  }
};

const statusClass = (value?: string) => {
  switch (value) {
    case "AVAILABLE":
      return "status-available";
    case "OCCUPIED":
      return "status-occupied";
    case "MAINTENANCE":
      return "status-maintenance";
    default:
      return "status-unknown";
  }
};

const isLockedStatus = (value?: string) =>
  value === "OCCUPIED" || value === "MAINTENANCE";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [code, setCode] = useState("");
  const [floor, setFloor] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [areaId, setAreaId] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editFloor, setEditFloor] = useState("");
  const [editStatus, setEditStatus] = useState("AVAILABLE");
  const [editAreaId, setEditAreaId] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const role = getRole();
  const isAdmin = role === "ADMIN";
  const { notify } = useToast();

  const load = async () => {
    const [roomRes, areaRes] = await Promise.all([
      api.get("/rooms"),
      api.get("/areas"),
    ]);
    setRooms(roomRes.data);
    setAreas(areaRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    const priceValue = parseCurrencyInput(price);
    if (!trimmedCode || !areaId || !priceValue) {
      setError("Vui lòng nhập Mã phòng, Khu và Giá phòng");
      return;
    }
    setError("");
    try {
      await api.post("/rooms", {
        code: trimmedCode,
        floor: floor.trim() || null,
        status,
        currentPrice: priceValue,
        area: areaId ? { id: Number(areaId) } : null,
      });
      notify("Thêm phòng thành công", "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Thêm phòng thất bại";
      setError(message);
      notify(message, "error");
      return;
    }
    setCode("");
    setFloor("");
    setPrice("");
    setShowCreate(false);
    load();
  };

  const startEdit = (room: Room) => {
    setEditing(room);
    setEditCode(room.code || "");
    setEditFloor(room.floor || "");
    setEditStatus(room.status || "AVAILABLE");
    setEditAreaId(room.area?.id ? String(room.area.id) : "");
    setEditPrice(room.currentPrice != null ? String(room.currentPrice) : "");
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const trimmedCode = editCode.trim();
    const editPriceValue = parseCurrencyInput(editPrice);
    if (!trimmedCode || !editAreaId || !editPriceValue) {
      setEditError("Vui lòng nhập Mã phòng, Khu và Giá phòng");
      return;
    }
    setEditError("");
    try {
      await api.put(`/rooms/${editing.id}`, {
        code: trimmedCode,
        floor: editFloor.trim() || null,
        status: editStatus,
        currentPrice: editPriceValue,
        area: editAreaId ? { id: Number(editAreaId) } : null,
      });
      notify("Cập nhật phòng thành công", "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Cập nhật thất bại";
      setEditError(message);
      notify(message, "error");
      return;
    }
    setEditing(null);
    setEditCode("");
    setEditFloor("");
    setEditPrice("");
    setEditAreaId("");
    load();
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditCode("");
    setEditFloor("");
    setEditPrice("");
    setEditAreaId("");
    setEditError("");
  };

  const askRemove = (room: Room) => {
    if (isLockedStatus(room.status)) {
      notify("Phòng đang cho thuê/bảo trì, không thể xóa", "error");
      return;
    }
    setConfirmId(room.id);
    setConfirmName(room.code);
  };

  const confirmRemove = async () => {
    if (confirmId == null) return;
    const room = rooms.find((r) => r.id === confirmId);
    if (isLockedStatus(room?.status)) {
      notify("Phòng đang cho thuê/bảo trì, không thể xóa", "error");
      setConfirmId(null);
      setConfirmName("");
      return;
    }
    try {
      await api.delete(`/rooms/${confirmId}`);
      notify("Xóa phòng thành công", "success");
    } catch (err: any) {
      setConfirmId(null);
      setConfirmName("");
      const message =
        err?.response?.status === 403
          ? "Bạn không có quyền thao tác"
          : "Xóa thất bại";
      setError(message);
      notify(message, "error");
      return;
    }
    setConfirmId(null);
    setConfirmName("");
    load();
  };

  const cancelRemove = () => {
    setConfirmId(null);
    setConfirmName("");
  };

  const filtered = rooms.filter((room) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q
      ? true
      : room.code?.toLowerCase().includes(q) ||
        room.floor?.toLowerCase().includes(q) ||
        room.status?.toLowerCase().includes(q) ||
        room.area?.name?.toLowerCase().includes(q);
    const matchesStatus = statusFilter ? room.status === statusFilter : true;
    return matchesQuery && matchesStatus;
  });

  const formatNumber = (value?: number) =>
    value == null ? "" : new Intl.NumberFormat("vi-VN").format(value);
  const isEditLocked = editing ? isLockedStatus(editing.status) : false;

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Quản lý phòng</h2>
        <div className="card">
          <div className="grid grid-3">
            <input
              placeholder="Tìm kiếm theo mã, tầng, khu, trạng thái..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AVAILABLE">Trống</option>
              <option value="OCCUPIED">Đang thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={() => setShowCreate(true)}>
                  Thêm phòng mới
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
              { header: "ID", render: (r) => r.id },
              { header: "Mã", render: (r) => r.code },
              { header: "Tầng", render: (r) => r.floor },
              {
                header: "Trạng thái",
                render: (r) => (
                  <span className={`status-badge ${statusClass(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                ),
              },
              { header: "Khu", render: (r) => r.area?.name },
              {
                header: "Giá",
                render: (r) =>
                  r.currentPrice == null
                    ? ""
                    : `${formatNumber(r.currentPrice)} VNĐ`,
              },
              ...(isAdmin
                ? [
                    {
                      header: "Thao tác",
                      render: (r: Room) => {
                        const locked = isLockedStatus(r.status);
                        return (
                          <div className="table-actions">
                            <button
                              className="btn"
                              onClick={() => startEdit(r)}
                            >
                              Sửa
                            </button>
                            <button
                              className={`btn btn-secondary ${locked ? "btn-disabled" : ""}`}
                              onClick={() => askRemove(r)}
                              title={
                                locked
                                  ? "Phòng đang cho thuê/bảo trì, không thể xóa"
                                  : undefined
                              }
                            >
                              Xóa
                            </button>
                          </div>
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
                  <h3>Thêm phòng mới</h3>
                  <p className="card-subtitle">Điền thông tin phòng</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">
                    Mã phòng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Ví dụ: P101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">Tầng</label>
                  <input
                    placeholder="Ví dụ: Tầng 1"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang thuê</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    Khu <span className="required">*</span>
                  </label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                  >
                    <option value="">Chọn khu</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    Giá phòng <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Ví dụ: 2.500.000"
                      value={price}
                      onChange={(e) =>
                        setPrice(formatCurrencyInput(e.target.value))
                      }
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
                    Thêm phòng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>Chỉnh sửa phòng</h3>
              <div className="form-grid">
                <div>
                  <label className="field-label">
                    Mã phòng <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Mã phòng"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    disabled={isEditLocked}
                  />
                </div>
                <div>
                  <label className="field-label">Tầng</label>
                  <input
                    placeholder="Tầng"
                    value={editFloor}
                    onChange={(e) => setEditFloor(e.target.value)}
                    disabled={isEditLocked}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Trạng thái <span className="required">*</span>
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang thuê</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">
                    Khu <span className="required">*</span>
                  </label>
                  <select
                    value={editAreaId}
                    onChange={(e) => setEditAreaId(e.target.value)}
                    disabled={isEditLocked}
                  >
                    <option value="">Chọn khu</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-span-2">
                  <label className="field-label">
                    Giá phòng <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Giá phòng"
                      value={editPrice}
                      onChange={(e) =>
                        setEditPrice(formatCurrencyInput(e.target.value))
                      }
                      disabled={isEditLocked}
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                {isEditLocked && (
                  <div className="form-error">
                    Phòng đang cho thuê/bảo trì, chỉ cho phép đổi trạng thái.
                  </div>
                )}
                {editError && <div className="form-error">{editError}</div>}
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  Hủy
                </button>
                <button className="btn" onClick={saveEdit}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmId != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Xác nhận xóa</h3>
              <p>
                Bạn có chắc muốn xóa phòng{" "}
                <strong>{confirmName || "này"}</strong>?
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelRemove}>
                  Hủy
                </button>
                <button className="btn" onClick={confirmRemove}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
