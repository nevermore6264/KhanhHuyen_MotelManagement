"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import NavBar from "@/components/NavBar";
import SimpleTable from "@/components/SimpleTable";
import api from "@/lib/api";

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

  const load = async () => {
    const res = await api.get("/service-prices");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/service-prices", {
      roomPrice: roomPrice ? Number(roomPrice) : null,
      electricityPrice: electricityPrice ? Number(electricityPrice) : null,
      waterPrice: waterPrice ? Number(waterPrice) : null,
      effectiveFrom,
    });
    setRoomPrice("");
    setElectricityPrice("");
    setWaterPrice("");
    setEffectiveFrom("");
    load();
  };

  return (
    <ProtectedPage>
      <NavBar />
      <div className="container">
        <h2>Bảng giá dịch vụ</h2>
        <div className="card">
          <form onSubmit={create} className="grid grid-3">
            <input
              placeholder="Giá phòng"
              value={roomPrice}
              onChange={(e) => setRoomPrice(e.target.value)}
            />
            <input
              placeholder="Giá điện"
              value={electricityPrice}
              onChange={(e) => setElectricityPrice(e.target.value)}
            />
            <input
              placeholder="Giá nước"
              value={waterPrice}
              onChange={(e) => setWaterPrice(e.target.value)}
            />
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
            />
            <button className="btn" type="submit">
              Cập nhật giá
            </button>
          </form>
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
      </div>
    </ProtectedPage>
  );
}
