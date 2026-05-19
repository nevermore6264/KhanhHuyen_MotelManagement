export type YeuCauHang = {
  id: string;
  tieuDe: string;
  moTa?: string;
  trangThai: string;
  ngayTao?: string;
  khachTen?: string;
  khachEmail?: string;
  maPhong?: string;
};

export function chuanHoaTrangThai(tt: unknown): string {
  if (typeof tt === "string") return tt;
  if (tt && typeof tt === "object" && "name" in tt) {
    return String((tt as { name?: string }).name ?? "");
  }
  if (tt != null) return String(tt);
  return "";
}

function chuanHoaNgayTao(nt: unknown): string | undefined {
  if (typeof nt === "string") return nt;
  if (Array.isArray(nt) && nt.length >= 3) {
    const y = Number(nt[0]);
    const m = Number(nt[1]);
    const d = Number(nt[2]);
    const h = nt.length > 3 ? Number(nt[3]) : 0;
    const mi = nt.length > 4 ? Number(nt[4]) : 0;
    const s = nt.length > 5 ? Number(nt[5]) : 0;
    if (y) return new Date(y, m - 1, d, h, mi, s).toISOString();
  }
  return undefined;
}

export function chuanHoaYeuCau(raw: unknown): YeuCauHang {
  const r = raw as Record<string, unknown>;
  const khachRaw = (r.khachThue ?? r.tenant) as
    | Record<string, unknown>
    | undefined;
  const phongRaw = (r.phong ?? r.room) as Record<string, unknown> | undefined;

  let khachTen: string | undefined;
  let khachEmail: string | undefined;
  if (khachRaw) {
    const ten = khachRaw.hoTen ?? khachRaw.fullName;
    if (ten != null) khachTen = String(ten).trim() || undefined;
    if (khachRaw.email != null) {
      khachEmail = String(khachRaw.email).trim() || undefined;
    }
  }

  let maPhong: string | undefined;
  if (phongRaw) {
    const ma = phongRaw.maPhong ?? phongRaw.code;
    if (ma != null) maPhong = String(ma).trim() || undefined;
  }
  if (!maPhong) {
    const hopDongRaw = r.hopDong as Record<string, unknown> | undefined;
    const phongHd = hopDongRaw?.phong as Record<string, unknown> | undefined;
    if (phongHd) {
      const ma = phongHd.maPhong ?? phongHd.code;
      if (ma != null) maPhong = String(ma).trim() || undefined;
    }
  }

  return {
    id: r.id != null ? String(r.id) : "",
    tieuDe: String(r.tieuDe ?? r.title ?? "").trim(),
    moTa:
      r.moTa != null
        ? String(r.moTa)
        : r.description != null
          ? String(r.description)
          : undefined,
    trangThai: chuanHoaTrangThai(r.trangThai ?? r.status),
    ngayTao: chuanHoaNgayTao(r.ngayTao),
    khachTen,
    khachEmail,
    maPhong,
  };
}
