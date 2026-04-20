/**
 * REST /api/thong-bao trả entity ThongBao: noiDung, daDoc, thoiGianGui.
 * WebSocket payload dùng message, readFlag, sentAt — hàm này gộp hai kiểu cho UI.
 */

export type ThongBaoUi = {
  id: string;
  message: string;
  readFlag: boolean;
  sentAt: string;
};

function thoiGianRaChuoi(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length >= 3) {
    const y = Number(v[0]);
    const M = Number(v[1]) || 1;
    const d = Number(v[2]) || 1;
    const h = Number(v[3]) || 0;
    const m = Number(v[4]) || 0;
    const s = Number(v[5]) || 0;
    if (!y) return "";
    return new Date(y, M - 1, d, h, m, s).toISOString();
  }
  return "";
}

export function mapThongBaoFromApi(raw: Record<string, unknown>): ThongBaoUi {
  const noiDung =
    raw.noiDung != null
      ? String(raw.noiDung)
      : raw.message != null
        ? String(raw.message)
        : "";
  const readFlag = Boolean(
    raw.daDoc !== undefined ? raw.daDoc : raw.readFlag,
  );
  const sentAt = thoiGianRaChuoi(raw.thoiGianGui ?? raw.sentAt);
  return {
    id: raw.id != null ? String(raw.id) : "",
    message: noiDung,
    readFlag,
    sentAt,
  };
}
