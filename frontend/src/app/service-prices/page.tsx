"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type ServicePrice = {
  id: number;
  roomPrice?: number;
  electricityPrice?: number;
  waterPrice?: number;
  effectiveFrom?: string;
};

export default function ServicePricesPage() {
  const [items, setItems] = useState<ServicePrice[]>([]);
  const [roomPrice, setRoomPrice] = useState("");
  const [electricityPrice, setElectricityPrice] = useState("");
  const [waterPrice, setWaterPrice] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { notify } = useToast();

  const load = async () => {
    const res = await api.get("/service-prices");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomPrice || !electricityPrice || !waterPrice || !effectiveFrom) {
      setError("Vui lòng nhập đầy đủ giá phòng, điện, nước và ngày hiệu lực");
      return;
    }
    setError("");
    await api.post("/service-prices", {
      roomPrice: Number(roomPrice),
      electricityPrice: Number(electricityPrice),
      waterPrice: Number(waterPrice),
      effectiveFrom,
    });
    notify("Cập nhật bảng giá thành công", "success");
    setRoomPrice("");
    setElectricityPrice("");
    setWaterPrice("");
    setEffectiveFrom("");
    setShowCreate(false);
    load();
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Bảng giá dịch vụ</h2>
        <div className="card">
          <div className="grid grid-2">
            <div>
              <h3>Bảng giá hiện hành</h3>
              <p className="card-subtitle">
                Cập nhật giá phòng, điện, nước theo kỳ.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setShowCreate(true)}>
                Thêm bảng giá
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <SimpleTable
            data={items}
            columns={[
              { header: "ID", render: (i) => i.id },
              { header: "Giá phòng", render: (i) => i.roomPrice },
              { header: "Giá điện", render: (i) => i.electricityPrice },
              { header: "Giá nước", render: (i) => i.waterPrice },
              { header: "Hiệu lực", render: (i) => i.effectiveFrom },
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
                    Giá phòng <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Giá phòng"
                      inputMode="numeric"
                      value={roomPrice}
                      onChange={(e) => setRoomPrice(e.target.value)}
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Giá điện <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Giá điện"
                      inputMode="numeric"
                      value={electricityPrice}
                      onChange={(e) => setElectricityPrice(e.target.value)}
                    />
                    <span>VNĐ</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">
                    Giá nước <span className="required">*</span>
                  </label>
                  <div className="input-suffix">
                    <input
                      placeholder="Giá nước"
                      inputMode="numeric"
                      value={waterPrice}
                      onChange={(e) => setWaterPrice(e.target.value)}
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
      </div>
    </ProtectedPage>
  );
}
