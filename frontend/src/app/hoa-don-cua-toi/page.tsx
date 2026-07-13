"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import { IconCheck, IconEye, IconTimes, IconDownload } from "@/components/Icons";
import api from "@/lib/api";
import { taiFileTuApi } from "@/lib/taiFile";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanTrangThaiHoaDon } from "@/lib/trangThai";
import { dinhDangTien, dinhDangSo, dinhDangNgay } from "@/lib/locale";
import type { Invoice, RawJson } from "@/lib/mapHoaDonApi";
import { mapHoaDonFromApi } from "@/lib/mapHoaDonApi";
import { classBadgeHoaDon } from "@/lib/badgeTrangThai";

const canPay = (status?: string) => status === "UNPAID" || status === "PARTIAL";

function TrangHoaDonCuaToiNoiDung() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Invoice[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [xemChiTiet, setXemChiTiet] = useState<Invoice | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "fail" | "cancel";
    text: string;
  } | null>(null);
  const { notify } = useToast();
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.hoaDonCuaToi;
  const hp = tr.pages.hoaDon;
  const s = tr.pages.shared;
  const c = tr.common;

  const formatMoney = (n?: number | null) => {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return dinhDangTien(Math.round(Number(n)), lang);
  };
  const formatChiSo = (n?: number) =>
    n != null && Number.isFinite(n) ? dinhDangSo(n, lang) : "—";

  const taiLaiHoaDon = async () => {
    const res = await api.get("/hoa-don/cua-toi");
    const arr = Array.isArray(res.data) ? res.data : [];
    const mapped = arr.map((x) => mapHoaDonFromApi(x as RawJson));
    const withRemain = await Promise.all(
      mapped.map(async (inv) => {
        if (inv.status !== "UNPAID" && inv.status !== "PARTIAL") {
          return { ...inv, remaining: 0 };
        }
        try {
          const r = await api.get(`/thanh-toan/hoa-don/${inv.id}`);
          const list = Array.isArray(r.data) ? r.data : [];
          const paid = list.reduce(
            (sum, row) =>
              sum + Number((row as { soTien?: unknown }).soTien ?? 0),
            0,
          );
          const rem = Math.max(0, Math.round((inv.total ?? 0) - paid));
          return { ...inv, remaining: rem };
        } catch {
          return { ...inv, remaining: inv.total };
        }
      }),
    );
    setItems(withRemain);
    return withRemain;
  };

  useEffect(() => {
    taiLaiHoaDon().catch(() => undefined);
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setMessage({ type: "success", text: p.okPayment });
      const orderCode = searchParams.get("orderCode");
      const code = searchParams.get("code");
      const status = searchParams.get("status");
      const cancel = searchParams.get("cancel");
      if (orderCode) {
        api
          .post("/thanh-toan/payos/xac-nhan-tra-ve", {
            orderCode,
            code,
            status,
            cancel,
          })
          .catch(() => undefined);
      }

      const timers = [1200, 3500, 7000, 12000].map((ms) =>
        window.setTimeout(() => {
          taiLaiHoaDon().catch(() => undefined);
        }, ms),
      );
      return () => timers.forEach((id) => window.clearTimeout(id));
    }
    if (payment === "cancel") {
      setMessage({ type: "cancel", text: p.cancelPayment });
    }
  }, [searchParams]);

  const handlePay = async (invoiceId: string) => {
    setPayingId(invoiceId);
    setMessage(null);
    try {
      const res = await api.post<{ paymentUrl: string }>(
        "/thanh-toan/tao-link",
        { invoiceId },
      );
      const url = res.data?.paymentUrl;
      if (url) {
        window.location.href = url;
        return;
      }
    } catch {
      setMessage({
        type: "fail",
        text: p.failPaymentLink,
      });
    } finally {
      setPayingId(null);
    }
  };

  return (
    <TrangBaoVe>
      <div className="page-shell page-table page-shell-rong-95">
        <h2>{p.title}</h2>
        {message && (
          <div
            className="card"
            style={{
              marginBottom: 16,
              backgroundColor:
                message.type === "success"
                  ? "#ecfdf5"
                  : message.type === "cancel"
                    ? "#fefce8"
                    : "#fef2f2",
              color:
                message.type === "success"
                  ? "#065f46"
                  : message.type === "cancel"
                    ? "#854d0e"
                    : "#991b1b",
            }}
          >
            {message.text}
          </div>
        )}
        <div className="card">
          <BangDonGian
            data={items}
            columns={[
              {
                header: s.id,
                render: (i) => (
                  <span title={i.id}>
                    {i.id.length > 10 ? `${i.id.slice(0, 8)}…` : i.id}
                  </span>
                ),
              },
              { header: hp.room, render: (i) => i.room?.code ?? "—" },
              {
                header: p.monthYear,
                render: (i) => `${i.month}/${i.year}`,
              },
              {
                header: p.total,
                render: (i) => (
                  <div>
                    <div>{formatMoney(i.total)}</div>
                    {i.remaining != null &&
                      i.total != null &&
                      i.remaining < i.total && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginTop: 4,
                            fontWeight: 500,
                          }}
                        >
                          {p.remaining}: {formatMoney(i.remaining)}
                        </div>
                      )}
                  </div>
                ),
              },
              {
                header: hp.status,
                render: (i) => (
                  <span
                    className={classBadgeHoaDon(i.status)}
                  >
                    {nhanTrangThaiHoaDon(tr, i.status)}
                  </span>
                ),
              },
              {
                header: s.actions,
                render: (i) => (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setXemChiTiet(i)}
                    >
                      <IconEye /> {p.detail}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() =>
                        void taiFileTuApi(
                          `/hoa-don/${i.id}/xuat-pdf`,
                          `hoa-don-${i.id}.pdf`,
                        ).catch(() => notify(p.errDownloadPdf, "error"))
                      }
                    >
                      <IconDownload /> {p.pdf}
                    </button>
                    {canPay(i.status) ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={payingId === i.id}
                        onClick={() => handlePay(i.id)}
                      >
                        {payingId === i.id ? (
                          p.paying
                        ) : (
                          <>
                            <IconCheck /> {p.pay}
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        </div>

        {xemChiTiet && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={() => setXemChiTiet(null)}
          >
            <div
              className="modal-card form-card"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header">
                <div>
                  <h3>{p.detailTitle}</h3>
                  <p className="card-subtitle">
                    {p.detailSub
                      .replace("{room}", xemChiTiet.room?.code ?? "—")
                      .replace(
                        "{period}",
                        `${xemChiTiet.month}/${xemChiTiet.year}`,
                      )}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.roomRent}</span>
                  <strong>{formatMoney(xemChiTiet.roomCost)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.electricOld}</span>
                  <strong>{formatChiSo(xemChiTiet.electricOld)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.electricNew}</span>
                  <strong>{formatChiSo(xemChiTiet.electricNew)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.electricCost}</span>
                  <strong>{formatMoney(xemChiTiet.electricityCost)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.waterOld}</span>
                  <strong>{formatChiSo(xemChiTiet.waterOld)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.waterNew}</span>
                  <strong>{formatChiSo(xemChiTiet.waterNew)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span>{p.waterCost}</span>
                  <strong>{formatMoney(xemChiTiet.waterCost)}</strong>
                </div>
                {xemChiTiet.lineItems &&
                  xemChiTiet.lineItems.length > 0 &&
                  xemChiTiet.lineItems.map((l) => (
                    <div
                      key={l.id ?? `${l.tenKhoan}-${l.soTien}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <span>{l.tenKhoan}</span>
                      <strong>{formatMoney(l.soTien)}</strong>
                    </div>
                  ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0 0",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#102a5c",
                  }}
                >
                  <span>{p.total}</span>
                  <strong>{formatMoney(xemChiTiet.total)}</strong>
                </div>
                {xemChiTiet.remaining != null &&
                  xemChiTiet.total != null &&
                  xemChiTiet.remaining < xemChiTiet.total && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0 0",
                        fontSize: "0.95rem",
                        color: "#0f172a",
                      }}
                    >
                      <span>{p.remainingPay}</span>
                      <strong style={{ color: "#4f7cff" }}>
                        {formatMoney(xemChiTiet.remaining)}
                      </strong>
                    </div>
                  )}
              </div>
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    void taiFileTuApi(
                      `/hoa-don/${xemChiTiet.id}/xuat-pdf`,
                      `hoa-don-${xemChiTiet.id}.pdf`,
                    ).catch(() => notify(p.errDownloadPdf, "error"))
                  }
                >
                  <IconDownload /> {p.pdf}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setXemChiTiet(null)}
                >
                  <IconTimes /> {c.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}

export default function TrangHoaDonCuaToi() {
  return (
    <Suspense fallback={null}>
      <TrangHoaDonCuaToiNoiDung />
    </Suspense>
  );
}
