/**
 * Chuẩn hóa JSON ThanhToan từ Spring (soTien, phuongThuc, thoiGianThanhToan, hoaDon)
 * sang dạng dùng trên UI (amount, method, paidAt, invoice).
 */

export type PaymentRow = {
  id: number;
  amount: number;
  method: string;
  paidAt: string;
  invoice?: { id: string; month: number; year: number };
};

function parseSoTien(v: unknown): number {
  if (v == null) return NaN;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(String(v).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

/** Jackson có thể trả ISO string hoặc mảng [y,m,d,h,min,sec,nano] nếu bật timestamp. */
function thoiGianThanhToanRaChuoiIso(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length >= 3) {
    const y = Number(v[0]);
    const mo = Number(v[1]);
    const d = Number(v[2]);
    const h = v.length > 3 ? Number(v[3]) : 0;
    const mi = v.length > 4 ? Number(v[4]) : 0;
    const s = v.length > 5 ? Number(v[5]) : 0;
    const nano = v.length > 6 ? Number(v[6]) : 0;
    const ms = Math.floor(nano / 1_000_000);
    return new Date(Date.UTC(y, mo - 1, d, h, mi, s, ms)).toISOString();
  }
  return "";
}

function phuongThucRaChuoi(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "name" in v) {
    return String((v as { name?: string }).name ?? "");
  }
  return String(v);
}

export function chuanHoaThanhToanTuApi(raw: Record<string, unknown>): PaymentRow {
  const id = Number(raw.id);
  const amount = parseSoTien(raw.soTien ?? raw.amount);
  const method = phuongThucRaChuoi(raw.phuongThuc ?? raw.method);
  const paidAt = thoiGianThanhToanRaChuoiIso(
    raw.thoiGianThanhToan ?? raw.paidAt,
  );
  const hd = (raw.hoaDon ?? raw.invoice) as Record<string, unknown> | undefined;
  let invoice: PaymentRow["invoice"];
  if (hd && typeof hd === "object") {
    const month = Number(hd.thang ?? hd.month);
    const year = Number(hd.nam ?? hd.year);
    const hid = hd.id != null ? String(hd.id) : "";
    if (Number.isFinite(month) && Number.isFinite(year)) {
      invoice = { id: hid, month, year };
    }
  }
  return {
    id,
    amount,
    method,
    paidAt,
    ...(invoice ? { invoice } : {}),
  };
}
