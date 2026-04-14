"use client";

import { useEffect, useRef, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import ThanhDieuHuong from "@/components/ThanhDieuHuong";
import BangDonGian from "@/components/BangDonGian";
import { IconEye, IconDownload, IconTimes } from "@/components/Icons";
import api from "@/lib/api";
import {
  chuanHoaDanhSachHopDongTuApi,
  chuanHoaHopDongTuApi,
} from "@/lib/chuanHoaHopDongTuApi";
import { buildContractDocx, type ContractForDocx } from "@/lib/contractDocx";
import { renderAsync } from "docx-preview";
import { useToast } from "@/components/NhaCungCapToast";

type Room = { id: number; code: string; currentPrice?: number };
type Tenant = {
  id: number;
  fullName: string;
  phone?: string;
  idNumber?: string;
  address?: string;
};
type Contract = {
  id: number;
  room?: Room;
  tenant?: Tenant;
  coThue?: (Tenant & { laDaiDien?: boolean })[];
  startDate?: string;
  endDate?: string;
  status?: string;
  deposit?: number;
  rent?: number;
};

function hopDongChoDocx(c: Contract): ContractForDocx {
  return {
    id: c.id,
    room: c.room,
    tenant: c.tenant,
    coTenants: c.coThue?.map((m) => ({
      fullName: m.fullName,
      idNumber: m.idNumber,
      laDaiDien: m.laDaiDien,
    })),
    startDate: c.startDate,
    endDate: c.endDate,
    deposit: c.deposit,
    rent: c.rent,
  };
}

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

const formatDateDMY = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function TrangHopDongCuaToi() {
  const [items, setItems] = useState<Contract[]>([]);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { notify } = useToast();

  useEffect(() => {
    api
      .get("/hop-dong/cua-toi")
      .then((res) => setItems(chuanHoaDanhSachHopDongTuApi(res.data || [])));
  }, []);

  const fetchContractForDoc = async (id: number): Promise<Contract | null> => {
    try {
      const res = await api.get(`/hop-dong/cua-toi/${id}`);
      return chuanHoaHopDongTuApi(res.data as Record<string, unknown>);
    } catch {
      return null;
    }
  };

  const viewContractDoc = async (contract: Contract) => {
    const full = await fetchContractForDoc(contract.id);
    if (full) setPreviewContract(full);
    else {
      if (contract.room && contract.tenant && contract.rent != null) {
        setPreviewContract(contract);
      } else {
        notify("Không thể tải chi tiết hợp đồng.", "error");
      }
    }
  };

  useEffect(() => {
    if (!previewContract || !previewContainerRef.current) return;
    const el = previewContainerRef.current;
    setPreviewLoading(true);
    el.innerHTML = "";
    buildContractDocx(hopDongChoDocx(previewContract))
      .then((blob) => renderAsync(blob, el))
      .then(() => setPreviewLoading(false))
      .catch(() => setPreviewLoading(false));
  }, [previewContract?.id]);

  const downloadContractDoc = async (contract: Contract) => {
    try {
      const full =
        (await fetchContractForDoc(contract.id)) ||
        (contract.room && contract.tenant ? contract : null);
      if (!full) {
        notify("Không thể tải chi tiết hợp đồng.", "error");
        return;
      }
      const blob = await buildContractDocx(hopDongChoDocx(full));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hop-dong-thue-nha-tro-${full.room?.code || full.id || "phong"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      notify("Đã tải file hợp đồng.", "success");
    } catch {
      notify("Tải file thất bại.", "error");
    }
  };

  return (
    <TrangBaoVe>
      <ThanhDieuHuong />
      <div className="container">
        <h2>Hợp đồng của tôi</h2>
        <div className="card">
          <BangDonGian
            data={items}
            columns={[
              { header: "ID", render: (c) => c.id },
              { header: "Phòng", render: (c) => c.room?.code },
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
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => viewContractDoc(c)}
                      title="Xem nội dung hợp đồng"
                    >
                      <IconEye /> Xem
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => downloadContractDoc(c)}
                      title="Tải file Word"
                    >
                      <IconDownload /> Tải Word
                    </button>
                  </div>
                ),
              },
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
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setPreviewContract(null);
                    setPreviewLoading(false);
                  }}
                  style={{ flexShrink: 0 }}
                >
                  <IconTimes /> Đóng
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
                  Đang tải…
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
