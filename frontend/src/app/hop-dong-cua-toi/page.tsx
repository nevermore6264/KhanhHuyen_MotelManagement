"use client";

import { useEffect, useRef, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
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
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanTrangThaiHopDong } from "@/lib/trangThai";
import { classBadgeHopDong } from "@/lib/badgeTrangThai";
import { dinhDangNgay } from "@/lib/locale";
import HopDongXemModal from "@/components/HopDongXemModal";

type Room = { id: string; code: string; currentPrice?: number };
type Tenant = {
  id: string;
  fullName: string;
  phone?: string;
  idNumber?: string;
  address?: string;
};
type Contract = {
  id: string;
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

export default function TrangHopDongCuaToi() {
  const [items, setItems] = useState<Contract[]>([]);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { notify } = useToast();
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.hopDongCuaToi;
  const hp = tr.pages.hopDong;
  const s = tr.pages.shared;
  const c = tr.common;

  useEffect(() => {
    api
      .get("/hop-dong/cua-toi")
      .then((res) => setItems(chuanHoaDanhSachHopDongTuApi(res.data || [])));
  }, []);

  const fetchContractForDoc = async (id: string): Promise<Contract | null> => {
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
        notify(p.errLoad, "error");
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
        notify(p.errLoad, "error");
        return;
      }
      const blob = await buildContractDocx(hopDongChoDocx(full));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hop-dong-thue-nha-tro-${full.room?.code || full.id || "phong"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      notify(p.okDownload, "success");
    } catch {
      notify(p.errDownload, "error");
    }
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-table">
        <h2>{p.title}</h2>
        <div className="card">
          <BangDonGian
            data={items}
            columns={[
              { header: s.id, render: (row) => row.id },
              { header: hp.room, render: (row) => row.room?.code },
              {
                header: hp.start,
                render: (row) => dinhDangNgay(row.startDate, lang),
              },
              {
                header: hp.end,
                render: (row) => dinhDangNgay(row.endDate, lang),
              },
              {
                header: hp.status,
                render: (row) => (
                  <span
                    className={classBadgeHopDong(row.status)}
                  >
                    {nhanTrangThaiHopDong(tr, row.status)}
                  </span>
                ),
              },
              {
                header: p.contractCol,
                render: (row: Contract) => (
                  <div className="table-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => viewContractDoc(row)}
                      title={p.viewContract}
                    >
                      <IconEye /> {s.view}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => downloadContractDoc(row)}
                      title={p.downloadWordTitle}
                    >
                      <IconDownload /> {p.downloadWord}
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <HopDongXemModal
          open={!!previewContract}
          roomCode={previewContract?.room?.code}
          loading={previewLoading}
          previewContainerRef={previewContainerRef}
          onClose={() => {
            setPreviewContract(null);
            setPreviewLoading(false);
          }}
          closeLabel={
            <>
              <IconTimes /> {c.close}
            </>
          }
        />
      </div>
    </TrangBaoVe>
  );
}
