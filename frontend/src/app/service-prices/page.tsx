"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

type ServicePrice = {
  id: number;
  roomPrice?: number;
  electricityPrice?: number;
  waterPrice?: number;
  effectiveFrom?: string;
};

const formatMoney = (n?: number | null) => {
  if (n == null || isNaN(n)) return "—";
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(Number(n)))} VNĐ`;
};

const formatDateDMY = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
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

export default function ServicePricesPage() {
  const [items, setItems] = useState<ServicePrice[]>([]);
  const [electricityPrice, setElectricityPrice] = useState("");
  const [waterPrice, setWaterPrice] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ServicePrice | null>(null);
  const [editElectricityPrice, setEditElectricityPrice] = useState("");
  const [editWaterPrice, setEditWaterPrice] = useState("");
  const [editEffectiveFrom, setEditEffectiveFrom] = useState("");
  const [editError, setEditError] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const isAdmin = role === "ADMIN";
  const { notify } = useToast();

  useEffect(() => {
    setRole(getRole());
  }, []);

  const load = async () => {
    const res = await api.get("/service-prices");
    setItems(res.data);
  };

  useEffect(() => {
    if (role !== null) load();
  }, [role]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const ep = parseCurrencyInput(electricityPrice);
    const wp = parseCurrencyInput(waterPrice);
    if (ep == null || wp == null || !effectiveFrom) {
      setError("Vui lòng nhập đầy đủ giá điện, giá nước và ngày hiệu lực");
      return;
    }
    setError("");
    await api.post("/service-prices", {
      roomPrice: null,
      electricityPrice: ep,
      waterPrice: wp,
      effectiveFrom,
    });
    notify("Thêm bảng giá thành công", "success");
    setElectricityPrice("");
    setWaterPrice("");
    setEffectiveFrom("");
    setShowCreate(false);
    load();
  };

  const startEdit = (item: ServicePrice) => {
    setEditing(item);
    setEditElectricityPrice(
      item.electricityPrice != null
        ? formatCurrencyInput(String(item.electricityPrice))
        : "",
    );
    setEditWaterPrice(
      item.waterPrice != null
        ? formatCurrencyInput(String(item.waterPrice))
        : "",
    );
    setEditEffectiveFrom(item.effectiveFrom || "");
    setEditError("");
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const ep = parseCurrencyInput(editElectricityPrice);
    const wp = parseCurrencyInput(editWaterPrice);
    if (ep == null || wp == null || !editEffectiveFrom) {
      setEditError("Vui lòng nhập đầy đủ giá điện, giá nước và ngày hiệu lực");
      return;
    }
    setEditError("");
    await api.put(`/service-prices/${editing.id}`, {
      roomPrice: null,
      electricityPrice: ep,
      waterPrice: wp,
      effectiveFrom: editEffectiveFrom,
    });
    notify("Cập nhật bảng giá thành công", "success");
    setEditing(null);
    load();
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bảng giá này?")) return;
    await api.delete(`/service-prices/${id}`);
    notify("Đã xóa bảng giá", "success");
    load();
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Bảng giá dịch vụ</h2>
        <div className="card service-price-intro">
          <p className="service-price-intro-title">
            Màn hình này dùng để làm gì?
          </p>
          <ul className="service-price-intro-list">
            <li>
              <strong>Giá điện (VNĐ/kWh) và giá nước (VNĐ/m³)</strong> — Dùng để
              tính tiền điện, nước trong hóa đơn khi bạn nhập số công tơ (ở mục{" "}
              <strong>Ghi số điện nước</strong> hoặc khi lập hóa đơn). Hệ thống
              sẽ chọn bảng giá có <strong>ngày hiệu lực</strong> phù hợp với
              tháng tính tiền.
            </li>
            <li>
              <strong>Giá phòng</strong> — Không cấu hình ở đây. Giá thuê phòng
              được đặt theo từng phòng trong mục <strong>Phòng</strong> (khi
              thêm/sửa phòng).
            </li>
          </ul>
        </div>
        <div className="card">
          <div className="grid grid-2">
            <div>
              <h3>Bảng giá hiện hành</h3>
              <p className="card-subtitle">
                {items.length === 0
                  ? "Chưa có giá. Bấm bên phải để thiết lập giá điện và giá nước (chỉ cần một bộ giá)."
                  : "Chỉ cần một bộ giá điện + giá nước. Dùng Sửa để cập nhật, không cần thêm bản ghi mới."}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {isAdmin && items.length === 0 && (
                <button className="btn" onClick={() => setShowCreate(true)}>
                  Thiết lập giá điện & nước
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Giá điện (VNĐ/kWh) và giá nước (VNĐ/m³) dùng để tính tiền theo số
            công tơ. Giá phòng lấy theo từng phòng (cấu hình ở mục Phòng).
          </p>
          <SimpleTable
            data={items}
            columns={[
              { header: "ID", render: (i: ServicePrice) => i.id },
              {
                header: "Giá điện (VNĐ/kWh)",
                render: (i: ServicePrice) => formatMoney(i.electricityPrice),
              },
              {
                header: "Giá nước (VNĐ/m³)",
                render: (i: ServicePrice) => formatMoney(i.waterPrice),
              },
              {
                header: "Ngày hiệu lực",
                render: (i: ServicePrice) => formatDateDMY(i.effectiveFrom),
              },
              ...(isAdmin
                ? [
                    {
                      header: "Thao tác",
                      render: (i: ServicePrice) => (
                        <span
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEdit(i)}
                          >
                            Sửa
                          </button>
                          {items.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => deleteItem(i.id)}
                            >
                              Xóa
                            </button>
                          )}
                        </span>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {showCreate && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Thêm bảng giá</h3>
                  <p className="card-subtitle">Thiết lập giá dịch vụ</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div>
                  <label className="field-label">
                    Giá điện (VNĐ/kWh) <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 3.500"
                      inputMode="numeric"
                      value={electricityPrice}
                      onChange={(e) =>
                        setElectricityPrice(formatCurrencyInput(e.target.value))
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Giá nước (VNĐ/m³) <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 15.000"
                      inputMode="numeric"
                      value={waterPrice}
                      onChange={(e) =>
                        setWaterPrice(formatCurrencyInput(e.target.value))
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Ngày hiệu lực <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
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
                    Lưu bảng giá
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editing && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <div className="card-header">
                <div>
                  <h3>Sửa bảng giá</h3>
                  <p className="card-subtitle">
                    Cập nhật giá dịch vụ (hiệu lực từ ngày)
                  </p>
                </div>
              </div>
              <form onSubmit={saveEdit} className="form-grid">
                <div>
                  <label className="field-label">
                    Giá điện (VNĐ/kWh) <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 3.500"
                      inputMode="numeric"
                      value={editElectricityPrice}
                      onChange={(e) =>
                        setEditElectricityPrice(
                          formatCurrencyInput(e.target.value),
                        )
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Giá nước (VNĐ/m³) <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="VD: 15.000"
                      inputMode="numeric"
                      value={editWaterPrice}
                      onChange={(e) =>
                        setEditWaterPrice(formatCurrencyInput(e.target.value))
                      }
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Ngày hiệu lực <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={editEffectiveFrom}
                    onChange={(e) => setEditEffectiveFrom(e.target.value)}
                  />
                </div>
                {editError && <div className="form-error">{editError}</div>}
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setEditing(null)}
                  >
                    Hủy
                  </button>
                  <button className="btn" type="submit">
                    Lưu thay đổi
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
