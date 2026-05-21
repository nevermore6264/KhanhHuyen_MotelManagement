"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import TrangBaoVe from "@/components/TrangBaoVe";
import BangDonGian from "@/components/BangDonGian";
import {
  IconPlus,
  IconTimes,
  IconCheck,
  IconCalendar,
  IconEye,
  IconDownload,
} from "@/components/Icons";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { nhanTrangThaiHopDong } from "@/lib/trangThai";
import { classBadgeHopDong } from "@/lib/badgeTrangThai";
import {
  dinhDangTien,
  dinhDangNgay,
  layLocaleTag,
} from "@/lib/locale";
import { buildContractDocx, type ContractForDocx } from "@/lib/contractDocx";
import { renderAsync } from "docx-preview";
import ChonKhuCombobox, { type MucKhu } from "@/components/ChonKhuCombobox";
import HopDongXemModal from "@/components/HopDongXemModal";
import {
  chuanHoaDanhSachHopDongTuApi,
  chuanHoaKhachThueTuApi,
  chuanHoaPhongTuApiHopDong,
  type HopDongChuan,
  type RoomHopDong,
  type TenantHopDong,
} from "@/lib/chuanHoaHopDongTuApi";

type Room = RoomHopDong;
type Tenant = TenantHopDong;
type Contract = HopDongChuan;

type RawPhong = Record<string, unknown>;

const chuanHoaPhongTuApi = (r: RawPhong): Room =>
  chuanHoaPhongTuApiHopDong(r);

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

const parseCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
};

const tenantOptionLabel = (t: Tenant) => {
  const name = t.fullName || `Khách ${t.id}`;
  const extra = t.phone || t.idNumber;
  return extra ? `${name} — ${extra}` : name;
};

const addMonthsToDate = (startYMD: string, months: number): string => {
  if (!startYMD || months < 1) return "";
  const d = new Date(startYMD + "T12:00:00");
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function TrangHopDong() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [danhSachKhu, setDanhSachKhu] = useState<MucKhu[]>([]);
  const [khuId, setKhuId] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roomId, setRoomId] = useState("");
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [daiDienTenantId, setDaiDienTenantId] = useState<string | null>(null);
  const [showChonKhachModal, setShowChonKhachModal] = useState(false);
  const [draftKhachIds, setDraftKhachIds] = useState<string[]>([]);
  const [draftDaiDienId, setDraftDaiDienId] = useState<string | null>(null);
  const [chonKhachLoc, setChonKhachLoc] = useState("");
  const chonKhachInputRef = useRef<HTMLInputElement>(null);
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState<"" | "6" | "12" | "24">(
    "",
  );
  const [endDate, setEndDate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [rent, setRent] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [extendId, setExtendId] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [confirmEndId, setConfirmEndId] = useState<string | null>(null);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<string | null>(null);
  const isAdmin = role === "ADMIN";
  const isTenant = role === "TENANT";
  const { notify } = useToast();
  const { t: tr, lang } = useCaiDat();
  const p = tr.pages.hopDong;
  const s = tr.pages.shared;
  const c = tr.common;

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return new Intl.NumberFormat(layLocaleTag(lang)).format(Number(digits));
  };

  useEffect(() => {
    setRole(getRole());
  }, []);

  useEffect(() => {
    if (!showChonKhachModal) return;
    setChonKhachLoc("");
    const id = requestAnimationFrame(() =>
      chonKhachInputRef.current?.focus(),
    );
    return () => cancelAnimationFrame(id);
  }, [showChonKhachModal]);

  const load = async () => {
    try {
      if (isTenant) {
        const res = await api.get("/hop-dong/cua-toi");
        setContracts(chuanHoaDanhSachHopDongTuApi(res.data));
        setRooms([]);
        setDanhSachKhu([]);
        setTenants([]);
        return;
      }
      const [cRes, rRes, kRes, tRes] = await Promise.all([
        api.get("/hop-dong"),
        api.get("/phong"),
        api.get("/khu-vuc"),
        api.get("/khach-thue"),
      ]);
      setContracts(chuanHoaDanhSachHopDongTuApi(cRes.data));
      setRooms(((rRes.data as RawPhong[]) || []).map(chuanHoaPhongTuApi));
      setDanhSachKhu(
        ((kRes.data as { id?: string | number; ten?: string }[]) || []).map(
          (k) => ({
            id: k.id != null ? String(k.id) : "",
            ten: String(k.ten ?? ""),
          }),
        ),
      );
      setTenants(
        ((tRes.data as Record<string, unknown>[]) || [])
          .map((row) => chuanHoaKhachThueTuApi(row))
          .filter((x): x is Tenant => x != null),
      );
    } catch (err: any) {
      const message =
        err?.response?.status === 403 ? p.errViewList : p.errLoad;
      notify(message, "error");
    }
  };

  useEffect(() => {
    if (role !== null) load();
  }, [role]);

  useEffect(() => {
    if (!showCreate) return;
    const months = durationMonths === "" ? 0 : Number(durationMonths);
    if (months >= 1 && startDate) {
      setEndDate(addMonthsToDate(startDate, months));
    }
  }, [showCreate, startDate, durationMonths]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!khuId.trim()) {
      setError(p.errSelectArea);
      return;
    }
    if (!roomId) {
      setError(p.errSelectRoom);
      return;
    }
    if (selectedTenantIds.length === 0) {
      setError(p.errSelectTenants);
      return;
    }
    if (
      daiDienTenantId == null ||
      !selectedTenantIds.includes(daiDienTenantId)
    ) {
      setError(p.errSelectRep);
      return;
    }
    const idKhu = khuId;
    const phongDaChon = rooms.find((r) => roomId !== "" && r.id === roomId);
    if (
      phongDaChon &&
      phongDaChon.khuVucId != null &&
      phongDaChon.khuVucId !== idKhu
    ) {
      setError(p.errRoomWrongArea);
      return;
    }
    if (!startDate) {
      setError(p.errSelectStart);
      return;
    }
    if (!endDate) {
      setError(p.errSelectEnd);
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError(p.errEndBeforeStart);
      return;
    }
    const selectedRoom = rooms.find((r) => roomId !== "" && r.id === roomId);
    const rentValue =
      parseCurrencyInput(rent) ?? selectedRoom?.currentPrice ?? null;
    if (rentValue != null && rentValue < 0) {
      setError(p.errInvalidRent);
      return;
    }
    const depositValue = parseCurrencyInput(deposit);
    if (depositValue != null && depositValue < 0) {
      setError(p.errInvalidDeposit);
      return;
    }
    setError("");
    try {
      await api.post("/hop-dong", {
        phongId: roomId,
        khachThueIds: selectedTenantIds,
        daiDienKhachThueId: daiDienTenantId,
        startDate,
        endDate,
        deposit: depositValue,
        rent: rentValue,
      });
      notify(p.okCreate, "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403 ? s.noPermission : p.errCreate;
      setError(message);
      notify(message, "error");
      return;
    }
    setKhuId("");
    setRoomId("");
    setSelectedTenantIds([]);
    setDaiDienTenantId(null);
    setStartDate("");
    setDurationMonths("");
    setEndDate("");
    setDeposit("");
    setRent("");
    setShowCreate(false);
    load();
  };

  const moModalTaoHopDong = () => {
    setShowChonKhachModal(false);
    setError("");
    setKhuId("");
    setRoomId("");
    setSelectedTenantIds([]);
    setDaiDienTenantId(null);
    setStartDate("");
    setDurationMonths("");
    setEndDate("");
    setDeposit("");
    setRent("");
    setShowCreate(true);
  };

  const dongModalTaoHopDong = () => {
    setShowChonKhachModal(false);
    setShowCreate(false);
    setError("");
    setKhuId("");
    setRoomId("");
    setSelectedTenantIds([]);
    setDaiDienTenantId(null);
    setStartDate("");
    setDurationMonths("");
    setEndDate("");
    setDeposit("");
    setRent("");
  };

  const phongTrongTheoKhu = rooms.filter(
    (r) =>
      r.status === "AVAILABLE" && khuId && r.khuVucId === khuId,
  );

  const filtered = contracts.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const coTenantsHay = (c.coThue ?? [])
      .map((m) => m.fullName?.toLowerCase() ?? "")
      .join(" ");
    return (
      c.room?.code?.toLowerCase().includes(q) ||
      c.tenant?.fullName?.toLowerCase().includes(q) ||
      coTenantsHay.includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  });


  const tenantIdsWithActiveContract = new Set<string>();
  for (const c of contracts) {
    if (c.status !== "ACTIVE") continue;
    if (c.tenant?.id != null) tenantIdsWithActiveContract.add(c.tenant.id);
    for (const m of c.coThue ?? []) {
      if (m.id != null) tenantIdsWithActiveContract.add(m.id);
    }
  }
  const availableTenantsForNewContract = tenants.filter(
    (t) => !tenantIdsWithActiveContract.has(t.id),
  );

  const khachTrongModalSauLoc = useMemo(() => {
    const q = chonKhachLoc.trim().toLowerCase();
    if (!q) return availableTenantsForNewContract;
    return availableTenantsForNewContract.filter((t) => {
      const haystack = [
        t.fullName,
        t.phone,
        t.idNumber,
        t.email,
        String(t.id),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [availableTenantsForNewContract, chonKhachLoc]);

  const moChonKhachThuePopup = () => {
    setDraftKhachIds([...selectedTenantIds]);
    setDraftDaiDienId(daiDienTenantId);
    setShowChonKhachModal(true);
  };

  const dongChonKhachKhongLuu = () => {
    setShowChonKhachModal(false);
  };

  const xacNhanChonKhachThue = () => {
    if (draftKhachIds.length === 0) {
      notify(p.selectTenant, "error");
      return;
    }
    let dai = draftDaiDienId;
    if (dai == null || !draftKhachIds.includes(dai)) {
      dai = draftKhachIds[0]!;
    }
    setSelectedTenantIds([...draftKhachIds]);
    setDaiDienTenantId(dai);
    setShowChonKhachModal(false);
  };

  const toggleDraftKhach = (id: string) => {
    setDraftKhachIds((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      setDraftDaiDienId((dd) => {
        if (!has) {
          return dd == null ? id : dd;
        }
        if (dd !== id) return dd;
        return next.length ? next[0]! : null;
      });
      return next;
    });
  };


  const danhSachKhachHienThi = useMemo(() => {
    const rows = selectedTenantIds.map((id) => {
      const t = tenants.find((x) => x.id === id);
      const laDaiDien = daiDienTenantId === id;
      return {
        id,
        name: t?.fullName?.trim() || `Khách #${id}`,
        phone: (t?.phone || "").trim() || "—",
        idNumber: (t?.idNumber || "").trim() || "—",
        laDaiDien,
      };
    });
    return [...rows].sort(
      (a, b) => Number(b.laDaiDien) - Number(a.laDaiDien),
    );
  }, [selectedTenantIds, daiDienTenantId, tenants]);

  const openExtend = (contract: Contract) => {
    setExtendId(contract.id);
    setExtendDate(contract.endDate || "");
  };

  const saveExtend = async () => {
    if (!extendId || !extendDate) return;
    try {
      await api.put(`/hop-dong/${extendId}/gia-han`, { endDate: extendDate });
      notify(p.okExtend, "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403 ? s.noPermission : p.errExtend;
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
      await api.put(`/hop-dong/${confirmEndId}/ket-thuc`);
      notify(p.okEnd, "success");
    } catch (err: any) {
      const message =
        err?.response?.status === 403 ? s.noPermission : p.errEnd;
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

  const viewContractDoc = (contract: Contract) => {
    setPreviewContract(contract);
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
      const blob = await buildContractDocx(hopDongChoDocx(contract));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hop-dong-thue-nha-tro-${contract.room?.code || contract.id || "phong"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notify(p.errDownload, "error");
    }
  };

  return (
    <TrangBaoVe>
      <div className="container hop-dong-trang-container">
        <h2>{p.title}</h2>
        <div className="card">
          <div className="grid grid-2">
            <input
              placeholder={p.searchPh}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isAdmin && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn" onClick={moModalTaoHopDong}>
                  <IconPlus /> {p.create}
                </button>
              </div>
            )}
          </div>
          {!isAdmin && (
            <div className="form-error" style={{ marginTop: 12 }}>
              {isTenant ? p.viewOwn : s.viewOnly}
            </div>
          )}
        </div>
        <div className="card">
          <BangDonGian
            className="table-nowrap contracts-table-fit"
            data={filtered}
            columns={[
              { header: s.id, render: (row) => row.id },
              { header: p.room, render: (row) => row.room?.code },
              {
                header: p.tenant,
                render: (row) => {
                  const parts = (row.coThue ?? []).map((m) =>
                    m.laDaiDien
                      ? `${m.fullName} ${p.repSuffix}`
                      : m.fullName || "—",
                  );
                  return parts.length
                    ? parts.join(", ")
                    : row.tenant?.fullName ?? "—";
                },
              },
              {
                header: p.idRep,
                render: (row) => row.tenant?.idNumber ?? "—",
              },
              {
                header: p.start,
                render: (row) => dinhDangNgay(row.startDate, lang),
              },
              {
                header: p.end,
                render: (row) => dinhDangNgay(row.endDate, lang),
              },
              {
                header: p.rentMonthly,
                render: (row) =>
                  row.rent != null ? dinhDangTien(row.rent, lang) : "—",
              },
              {
                header: p.status,
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
                      className="btn btn-secondary"
                      onClick={() => viewContractDoc(row)}
                      title={p.viewContract}
                    >
                      <IconEye /> {s.view}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => downloadContractDoc(row)}
                      title={p.downloadWordTitle}
                    >
                      <IconDownload /> {p.downloadWord}
                    </button>
                  </div>
                ),
              },
              ...(isAdmin
                ? [
                    {
                      header: s.actions,
                      render: (row: Contract) => (
                        <div className="table-actions">
                          <button className="btn" onClick={() => openExtend(row)}>
                            <IconCalendar /> {p.extend}
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => confirmEnd(row)}
                          >
                            <IconTimes /> {p.endContract}
                          </button>
                        </div>
                      ),
                    },
                  ]
                : []),
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
        />

        {showCreate && isAdmin && (
          <Fragment>
          <div className="modal-backdrop">
            <div className="modal-card form-card contract-create-modal">
              <div className="card-header">
                <div>
                  <h3>{p.create}</h3>
                  <p className="card-subtitle">{p.createSub}</p>
                </div>
              </div>
              <form onSubmit={create} className="form-grid">
                <div className="form-section form-span-2">
                  <h4 className="form-section-title">{p.sectionAreaRoom}</h4>
                  <div className="form-section-fields form-section-fields--khu-phong">
                    <div>
                      <label className="field-label">
                        {p.area} <span className="required">*</span>
                      </label>
                      <ChonKhuCombobox
                        danhSachKhu={danhSachKhu}
                        value={khuId}
                        onChange={(id) => {
                          setKhuId(id);
                          setRoomId("");
                          setRent("");
                        }}
                        placeholderChuaChon={p.selectArea}
                      />
                    </div>
                    <div>
                      <label className="field-label">
                        {p.room} <span className="required">*</span>
                      </label>
                      <select
                        value={roomId}
                        disabled={!khuId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setRoomId(id);
                          const room = rooms.find((r) => id !== "" && r.id === id);
                          setRent(
                            room?.currentPrice != null
                              ? formatCurrencyInput(String(room.currentPrice))
                              : "",
                          );
                        }}
                      >
                        <option value="">
                          {khuId ? p.selectRoom : p.selectAreaFirst}
                        </option>
                        {phongTrongTheoKhu.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.code}
                          </option>
                        ))}
                      </select>
                      {khuId && phongTrongTheoKhu.length === 0 && (
                        <p className="card-subtitle" style={{ marginTop: 4 }}>
                          {p.noEmptyRooms}
                        </p>
                      )}
                    </div>
                    <div className="form-section-full">
                      <label className="field-label">
                        {p.tenantsLabel}{" "}
                        <span className="required">*</span>
                      </label>
                      <div className="contract-create-khach-toolbar">
                        <p className="card-subtitle">{p.tenantsHint}</p>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={moChonKhachThuePopup}
                          disabled={
                            availableTenantsForNewContract.length === 0
                          }
                        >
                          {p.selectTenantsBtn}
                        </button>
                      </div>
                      <div className="hop-dong-create-khach-bang-wrap">
                        {selectedTenantIds.length === 0 ? (
                          <div className="hop-dong-khach-preview-empty">
                            <span className="text-muted">
                              {p.notSelectedTenants}
                            </span>
                          </div>
                        ) : (
                          <table className="hop-dong-create-khach-bang">
                            <thead>
                              <tr>
                                <th scope="col">{p.fullName}</th>
                                <th scope="col">{p.phone}</th>
                                <th scope="col">{p.idNumber}</th>
                                <th
                                  scope="col"
                                  className="hop-dong-create-khach-vai-tro"
                                >
                                  {p.role}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {danhSachKhachHienThi.map((row) => (
                                <tr key={row.id}>
                                  <td className="hop-dong-create-khach-ten">
                                    {row.name}
                                  </td>
                                  <td
                                    className="hop-dong-create-khach-so"
                                    title={
                                      row.phone !== "—"
                                        ? row.phone
                                        : undefined
                                    }
                                  >
                                    {row.phone}
                                  </td>
                                  <td
                                    className="hop-dong-create-khach-so"
                                    title={
                                      row.idNumber !== "—"
                                        ? row.idNumber
                                        : undefined
                                    }
                                  >
                                    {row.idNumber}
                                  </td>
                                  <td className="hop-dong-create-khach-vai-tro">
                                    {row.laDaiDien ? (
                                      <span
                                        className="hop-dong-khach-chip-badge"
                                        title={p.repTitle}
                                      >
                                        {p.representative}
                                      </span>
                                    ) : (
                                      <span className="text-muted">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                      {availableTenantsForNewContract.length === 0 && (
                        <p className="card-subtitle" style={{ marginTop: 4 }}>
                          {p.allTenantsBusy}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section form-span-2">
                  <h4 className="form-section-title">{p.sectionDuration}</h4>
                  <div className="form-section-fields form-section-fields--thoi-han-ba-cot">
                    <div>
                      <label className="field-label">
                        {p.startDate} <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">{p.duration}</label>
                      <select
                        value={durationMonths}
                        onChange={(e) =>
                          setDurationMonths(
                            (e.target.value || "") as "" | "6" | "12" | "24",
                          )
                        }
                      >
                        <option value="">{p.customDuration}</option>
                        <option value="6">{p.months6}</option>
                        <option value="12">{p.year1}</option>
                        <option value="24">{p.year2}</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">
                        {p.endDate} <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          if (durationMonths) setDurationMonths("");
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section form-span-2">
                  <h4 className="form-section-title">{p.sectionFinance}</h4>
                  <div className="form-section-fields">
                    <div>
                      <label className="field-label">{p.deposit}</label>
                      <div className="input-suffix">
                        <input
                          placeholder={p.pricePh}
                          value={deposit}
                          onChange={(e) =>
                            setDeposit(formatCurrencyInput(e.target.value))
                          }
                        />
                        <span>VNĐ</span>
                      </div>
                    </div>
                    <div>
                      <label className="field-label">{p.rent}</label>
                      <div className="input-suffix">
                        <input
                          placeholder={
                            khuId ? p.selectRoomForPrice : p.selectAreaRoomForPrice
                          }
                          value={rent}
                          readOnly
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            cursor: "not-allowed",
                          }}
                        />
                        <span>VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className="form-error form-span-2">{error}</div>}
                <div className="form-actions form-span-2">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={dongModalTaoHopDong}
                  >
                    <IconTimes /> {c.cancel}
                  </button>
                  <button className="btn btn-primary" type="submit">
                    <IconPlus /> {p.create}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {showChonKhachModal && (
            <div
              className="modal-backdrop"
              style={{ zIndex: 1100 }}
              role="presentation"
              onClick={(e) => {
                if (e.target === e.currentTarget) dongChonKhachKhongLuu();
              }}
            >
              <div
                className="modal-card"
                style={{ maxWidth: "min(980px, 96vw)", width: "100%" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="chon-khach-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 id="chon-khach-title" style={{ marginTop: 0 }}>
                  {p.selectTenantsTitle}
                </h3>
                <p className="card-subtitle" style={{ marginBottom: 10 }}>
                  {p.selectRepHint}
                </p>
                <div className="hop-dong-chon-khach-toolbar">
                  <input
                    ref={chonKhachInputRef}
                    type="search"
                    enterKeyHint="search"
                    placeholder={p.filterTenantPh}
                    value={chonKhachLoc}
                    onChange={(e) => setChonKhachLoc(e.target.value)}
                    autoComplete="off"
                    aria-label={p.filterTenantsAria}
                  />
                  <span className="hop-dong-chon-khach-toolbar-meta">
                    {chonKhachLoc.trim()
                      ? `${khachTrongModalSauLoc.length}/${availableTenantsForNewContract.length}`
                      : `${availableTenantsForNewContract.length}`}{" "}
                    {p.tenantUnit}
                  </span>
                </div>
                <div className="hop-dong-chon-khach-list-scroll">
                  {khachTrongModalSauLoc.length === 0 ? (
                    <div className="empty-state" style={{ padding: "20px 16px" }}>
                      {availableTenantsForNewContract.length === 0
                        ? p.noTenantsAvailable
                        : p.noFilterMatch}
                    </div>
                  ) : (
                    <>
                      <div className="hop-dong-chon-khach-head">
                        <span />
                        <span>{p.fullName}</span>
                        <span>{p.phone}</span>
                        <span>{p.idNumber}</span>
                        <span>{p.representative}</span>
                      </div>
                      {khachTrongModalSauLoc.map((t) => {
                        const checked = draftKhachIds.includes(t.id);
                        const cbId = `chon-khach-cb-${t.id}`;
                        const rdId = `chon-khach-dd-${t.id}`;
                        const sdt = t.phone?.trim() || "—";
                        const cccd = t.idNumber?.trim() || "—";
                        return (
                          <div key={t.id} className="hop-dong-chon-khach-row">
                            <input
                              id={cbId}
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDraftKhach(t.id)}
                            />
                            <label
                              htmlFor={cbId}
                              className="hop-dong-chon-khach-name"
                            >
                              {t.fullName?.trim() || `Khách #${t.id}`}
                            </label>
                            <p
                              className="hop-dong-chon-khach-col-text"
                              title={
                                t.phone?.trim()
                                  ? t.phone.trim()
                                  : undefined
                              }
                            >
                              {sdt}
                            </p>
                            <p
                              className="hop-dong-chon-khach-col-text"
                              title={
                                t.idNumber?.trim()
                                  ? t.idNumber.trim()
                                  : undefined
                              }
                            >
                              {cccd}
                            </p>
                            <div className="hop-dong-chon-khach-dai-dien-cell">
                              {checked ? (
                                <>
                                  <input
                                    id={rdId}
                                    type="radio"
                                    name="draftDaiDienHopDong"
                                    checked={draftDaiDienId === t.id}
                                    onChange={() => setDraftDaiDienId(t.id)}
                                  />
                                  <label htmlFor={rdId}>{p.representative}</label>
                                </>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
                <div className="modal-actions" style={{ marginTop: 16 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={dongChonKhachKhongLuu}
                  >
                    <IconTimes /> {c.cancel}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={xacNhanChonKhachThue}
                  >
                    <IconCheck /> {c.confirm}
                  </button>
                </div>
              </div>
            </div>
          )}
          </Fragment>
        )}

        {extendId != null && (
          <div className="modal-backdrop">
            <div className="modal-card form-card">
              <h3>{p.extendTitle}</h3>
              <div className="form-grid">
                <div className="form-span-2">
                  <label className="field-label">{p.newEndDate}</label>
                  <input
                    type="date"
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelExtend}>
                  <IconTimes /> {c.cancel}
                </button>
                <button className="btn" onClick={saveExtend}>
                  <IconCheck /> {c.save}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmEndId != null && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>{p.endTitle}</h3>
              <p>{p.endConfirm}</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelEnd}>
                  <IconTimes /> {c.cancel}
                </button>
                <button className="btn" onClick={endContract}>
                  <IconTimes /> {p.endContract}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TrangBaoVe>
  );
}
