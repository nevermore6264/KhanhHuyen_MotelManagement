"use client";

import { useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import api from "@/lib/api";
import { IconSend } from "@/components/Icons";

export default function TrangYeuCau() {
  const [tieuDe, setTieuDe] = useState("");
  const [moTa, setMoTa] = useState("");
  const [thongBao, setThongBao] = useState("");

  const gui = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/yeu-cau-ho-tro", { title: tieuDe, description: moTa });
    setTieuDe("");
    setMoTa("");
    setThongBao("Đã gửi yêu cầu hỗ trợ");
  };

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Gửi yêu cầu hỗ trợ</h2>
        <div className="card">
          <form onSubmit={gui} className="grid">
            <input
              placeholder="Tiêu đề"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
            />
            <textarea
              placeholder="Mô tả"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
            />
            <button className="btn" type="submit">
              <IconSend /> Gửi yêu cầu
            </button>
            {thongBao && <div>{thongBao}</div>}
          </form>
        </div>
      </div>
    </TrangBaoVe>
  );
}
