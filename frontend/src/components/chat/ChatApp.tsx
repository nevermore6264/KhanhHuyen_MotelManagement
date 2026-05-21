"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api, { API_ORIGIN } from "@/lib/api";
import { getUserId, setUserId } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";
import { thayMauChuoi } from "@/lib/i18n";
import { layLocaleTag } from "@/lib/locale";
import { nhanVaiTro } from "@/lib/trangThai";
import { IconPlus, IconSearch, IconSend } from "@/components/Icons";
import { createChatClient, type ChatSocketPayload } from "@/lib/chatSocket";

type HoiThoai = {
  id: string;
  loai: "GROUP" | "PRIVATE";
  tenHienThi?: string;
  doiTuongTen?: string;
  doiTuongVaiTro?: string;
  tinCuoi?: string;
  thoiGianTinCuoi?: string;
  soThanhVien?: number;
};

type PhanHoi = {
  emoji: string;
  soLuong: number;
  nguoiDungIds: string[];
  cuaToi: boolean;
};

type TinNhan = {
  id: string;
  hoiThoaiId?: string;
  loai: "TEXT" | "IMAGE" | "FILE";
  noiDung?: string;
  duongDanFile?: string;
  tenFile?: string;
  kichThuocFile?: number;
  loaiNoiDungFile?: string;
  thoiGianGui?: string;
  nguoiGuiId?: string;
  nguoiGuiTen?: string;
  nguoiGuiVaiTro?: string;
  phanHoi?: PhanHoi[];
};

type NguoiChat = {
  id: string;
  hoTen: string;
  tenDangNhap: string;
  vaiTro: string;
};

const EMOJI_GUI = [
  "😀", "😂", "😍", "👍", "👎", "❤️", "🎉", "🔥", "😢", "😮", "🙏", "💯",
  "😊", "🤔", "👏", "✨", "💪", "🥳", "😅", "🤝",
];

const REACTION_NHANH = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

function urlFile(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
}

function layChuCai(ten?: string) {
  const parts = (ten || "?").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatGioNgan(iso?: string, locale = "vi-VN") {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const homNay = d.toDateString() === now.toDateString();
  const gio = d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (homNay) return gio;
  const ngay = d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
  });
  return `${ngay} ${gio}`;
}

function nhanNhanNgay(
  iso: string,
  locale: string,
  today: string,
  yesterday: string,
) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const homQua = new Date(now);
  homQua.setDate(homQua.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return today;
  if (d.toDateString() === homQua.toDateString()) return yesterday;
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function gopTinTheoNgay(
  tin: TinNhan[],
  locale: string,
  today: string,
  yesterday: string,
) {
  const nhom: { key: string; label: string; items: TinNhan[] }[] = [];
  let lastKey = "";
  for (const msg of tin) {
    const iso = msg.thoiGianGui ?? new Date().toISOString();
    const key = new Date(iso).toDateString();
    if (key !== lastKey) {
      nhom.push({
        key,
        label: nhanNhanNgay(iso, locale, today, yesterday),
        items: [],
      });
      lastKey = key;
    }
    nhom[nhom.length - 1].items.push(msg);
  }
  return nhom;
}

export default function ChatApp() {
  const { t: i18n, lang } = useCaiDat();
  const ct = i18n.chat;
  const localeTag = layLocaleTag(lang);
  const [hoiThoai, setHoiThoai] = useState<HoiThoai[]>([]);
  const [hoiThoaiId, setHoiThoaiId] = useState<string | null>(null);
  const [tinNhan, setTinNhan] = useState<TinNhan[]>([]);
  const [noiDung, setNoiDung] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [moTimNguoi, setMoTimNguoi] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");
  const [locHoiThoai, setLocHoiThoai] = useState("");
  const [boLocLoai, setBoLocLoai] = useState<"all" | "GROUP" | "PRIVATE">(
    "all",
  );
  const [nguoiTim, setNguoiTim] = useState<NguoiChat[]>([]);
  const [moEmoji, setMoEmoji] = useState(false);
  const [userId, setUid] = useState<string | null>(null);
  const cuonRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const hoiThoaiIdRef = useRef<string | null>(null);
  const { notify } = useToast();

  hoiThoaiIdRef.current = hoiThoaiId;

  const hoiThoaiChon = hoiThoai.find((h) => h.id === hoiThoaiId);

  const damBaoUserId = useCallback(async () => {
    let id = getUserId();
    if (!id) {
      try {
        const res = await api.get("/tai-khoan/cua-toi");
        id = res.data?.id != null ? String(res.data.id) : null;
        if (id) setUserId(id);
      } catch {}
    }
    setUid(id);
    return id;
  }, []);

  const taiHoiThoai = useCallback(async () => {
    try {
      const res = await api.get("/hoi-thoai");
      const ds = Array.isArray(res.data) ? (res.data as HoiThoai[]) : [];
      setHoiThoai(ds);
      setHoiThoaiId((cur) => {
        if (cur && ds.some((h) => h.id === cur)) return cur;
        const nhom = ds.find((h) => h.loai === "GROUP");
        return nhom?.id ?? ds[0]?.id ?? null;
      });
    } catch {
      notify(ct.errLoadThreads, "error");
    }
  }, [notify]);

  const taiTin = useCallback(
    async (id: string) => {
      try {
        const res = await api.get(`/hoi-thoai/${id}/tin-nhan`);
        setTinNhan(Array.isArray(res.data) ? (res.data as TinNhan[]) : []);
        await api.put(`/hoi-thoai/${id}/da-doc`);
      } catch {
        notify(ct.errLoadMessages, "error");
      }
    },
    [notify],
  );

  const timNguoi = useCallback(async (q: string) => {
    try {
      const res = await api.get("/nguoi-dung/cho-chat", {
        params: q ? { q } : {},
      });
      setNguoiTim(Array.isArray(res.data) ? (res.data as NguoiChat[]) : []);
    } catch {
      setNguoiTim([]);
    }
  }, []);

  useEffect(() => {
    void damBaoUserId();
    void taiHoiThoai();
    const client = createChatClient((payload: ChatSocketPayload) => {
      const cur = hoiThoaiIdRef.current;
      if (payload.hoiThoaiId && payload.hoiThoaiId === cur) {
        if (payload.loaiSuKien === "MESSAGE" && payload.tinNhan) {
          const tin = payload.tinNhan as TinNhan;
          setTinNhan((prev) => {
            if (prev.some((t) => t.id === tin.id)) return prev;
            return [...prev, tin];
          });
        } else if (payload.loaiSuKien === "REACTION" && payload.tinNhan) {
          const tin = payload.tinNhan as TinNhan;
          setTinNhan((prev) =>
            prev.map((t) => (t.id === tin.id ? tin : t)),
          );
        } else {
          void taiTin(payload.hoiThoaiId);
        }
      }
      void taiHoiThoai();
    }, () => {});
    client?.activate();
    const poll = setInterval(() => {
      const id = hoiThoaiIdRef.current;
      if (id) void taiTin(id);
      void taiHoiThoai();
    }, 12000);
    return () => {
      clearInterval(poll);
      client?.deactivate?.();
    };
  }, [damBaoUserId, taiHoiThoai, taiTin]);

  useEffect(() => {
    if (hoiThoaiId) void taiTin(hoiThoaiId);
  }, [hoiThoaiId, taiTin]);

  useEffect(() => {
    cuonRef.current?.scrollTo({ top: cuonRef.current.scrollHeight });
  }, [tinNhan]);

  useEffect(() => {
    if (moTimNguoi) void timNguoi(tuKhoa);
  }, [moTimNguoi, tuKhoa, timNguoi]);

  const chonHoiThoai = (id: string) => {
    setHoiThoaiId(id);
    setMoEmoji(false);
  };

  const batDauChatRieng = async (nguoiDungId: string) => {
    try {
      const res = await api.post("/hoi-thoai/rieng", { nguoiDungId });
      const ht = res.data as HoiThoai;
      await taiHoiThoai();
      setHoiThoaiId(ht.id);
      setMoTimNguoi(false);
      setTuKhoa("");
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      notify(ax?.response?.data?.message ?? ct.errCreateThread, "error");
    }
  };

  const guiVanBan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const nd = noiDung.trim();
    if (!nd || !hoiThoaiId) return;
    setDangGui(true);
    try {
      await api.post(`/hoi-thoai/${hoiThoaiId}/tin-nhan`, { noiDung: nd });
      setNoiDung("");
      setMoEmoji(false);
      await taiTin(hoiThoaiId);
      await taiHoiThoai();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      notify(ax?.response?.data?.message ?? ct.errSend, "error");
    } finally {
      setDangGui(false);
    }
  };

  const guiFile = async (file: File) => {
    if (!hoiThoaiId) return;
    setDangGui(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (noiDung.trim()) fd.append("noiDung", noiDung.trim());
      await api.post(`/hoi-thoai/${hoiThoaiId}/tin-nhan/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNoiDung("");
      await taiTin(hoiThoaiId);
      await taiHoiThoai();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      notify(ax?.response?.data?.message ?? ct.errUpload, "error");
    } finally {
      setDangGui(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggleReaction = async (tinId: string, emoji: string) => {
    try {
      await api.post(`/hoi-thoai/tin-nhan/${tinId}/phan-hoi`, { emoji });
      if (hoiThoaiId) await taiTin(hoiThoaiId);
    } catch {
      notify(ct.errReaction, "error");
    }
  };

  const chenEmoji = (emoji: string) => {
    setNoiDung((s) => s + emoji);
  };

  const laCuaToi = (msg: TinNhan) => msg.nguoiGuiId === userId;

  const tenHienThiChon =
    hoiThoaiChon?.tenHienThi ??
    hoiThoaiChon?.doiTuongTen ??
    ct.conversation;

  const moTaHeader = hoiThoaiChon
    ? hoiThoaiChon.loai === "GROUP"
      ? ct.groupDesc
      : thayMauChuoi(ct.privateDesc, {
          name: hoiThoaiChon.doiTuongTen ?? "",
        })
    : "";

  const hoiThoaiLoc = useMemo(() => {
    let ds = hoiThoai;
    if (boLocLoai !== "all") {
      ds = ds.filter((h) => h.loai === boLocLoai);
    }
    const q = locHoiThoai.trim().toLowerCase();
    if (!q) return ds;
    return ds.filter((h) => {
      const ten = (h.tenHienThi ?? h.doiTuongTen ?? "").toLowerCase();
      const preview = (h.tinCuoi ?? "").toLowerCase();
      return ten.includes(q) || preview.includes(q);
    });
  }, [hoiThoai, locHoiThoai, boLocLoai]);

  const nhomTin = useMemo(
    () =>
      gopTinTheoNgay(tinNhan, localeTag, ct.today, ct.yesterday),
    [tinNhan, localeTag, ct.today, ct.yesterday],
  );

  return (
    <div className="chat-pro">
      <aside className="chat-pro__rail">
        <header className="chat-pro__rail-head">
          <div className="chat-pro__brand">
            <span className="chat-pro__brand-mark" aria-hidden>
              💬
            </span>
            <div>
              <h1>{ct.title}</h1>
              <p>{ct.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            className="chat-pro__new"
            onClick={() => setMoTimNguoi(true)}
            title={ct.newChat}
            aria-label={ct.newChat}
          >
            <IconPlus />
            <span>{ct.newChat}</span>
          </button>
        </header>

        <div className="chat-pro__filters" role="tablist">
          {(
            [
              { key: "all" as const, label: ct.filterAll },
              { key: "GROUP" as const, label: ct.filterGroup },
              { key: "PRIVATE" as const, label: ct.filterDirect },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={boLocLoai === f.key}
              className={`chat-pro__filter${boLocLoai === f.key ? " chat-pro__filter--on" : ""}`}
              onClick={() => setBoLocLoai(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="chat-pro__search">
          <IconSearch />
          <input
            type="search"
            placeholder={ct.searchThreads}
            value={locHoiThoai}
            onChange={(e) => setLocHoiThoai(e.target.value)}
          />
        </label>

        <ul className="chat-pro__threads">
          {hoiThoaiLoc.length === 0 && (
            <li className="chat-pro__threads-empty">{ct.noResults}</li>
          )}
          {hoiThoaiLoc.map((h) => {
            const ten = h.tenHienThi ?? h.doiTuongTen ?? ct.conversation;
            const laNhom = h.loai === "GROUP";
            return (
              <li key={h.id}>
                <button
                  type="button"
                  className={`chat-pro__thread${h.id === hoiThoaiId ? " chat-pro__thread--on" : ""}`}
                  onClick={() => chonHoiThoai(h.id)}
                >
                  <span
                    className={`chat-pro__thread-av${laNhom ? " chat-pro__thread-av--group" : ""}`}
                    aria-hidden
                  >
                    {laNhom ? "👥" : layChuCai(ten)}
                  </span>
                  <span className="chat-pro__thread-body">
                    <span className="chat-pro__thread-top">
                      <strong>{ten}</strong>
                      {h.thoiGianTinCuoi && (
                        <span className="chat-pro__thread-time">
                          {formatGioNgan(h.thoiGianTinCuoi, localeTag)}
                        </span>
                      )}
                    </span>
                    {laNhom && h.soThanhVien != null && (
                      <span className="chat-pro__thread-meta">
                        {h.soThanhVien} {ct.members}
                      </span>
                    )}
                    {!laNhom && h.doiTuongVaiTro && (
                      <span className="chat-pro__thread-meta">
                        {nhanVaiTro(i18n, h.doiTuongVaiTro)}
                      </span>
                    )}
                    {h.tinCuoi && (
                      <span className="chat-pro__thread-preview">
                        {h.tinCuoi}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {hoiThoaiChon ? (
        <section className="chat-pro__main">
          <header className="chat-pro__top">
            <span
              className={`chat-pro__top-av${hoiThoaiChon.loai === "GROUP" ? " chat-pro__top-av--group" : ""}`}
              aria-hidden
            >
              {hoiThoaiChon.loai === "GROUP"
                ? "👥"
                : layChuCai(tenHienThiChon)}
            </span>
            <div className="chat-pro__top-info">
              <div className="chat-pro__top-title-row">
                <h2>{tenHienThiChon}</h2>
                <span
                  className={`chat-pro__top-pill${hoiThoaiChon.loai === "GROUP" ? " chat-pro__top-pill--group" : ""}`}
                >
                  {hoiThoaiChon.loai === "GROUP"
                    ? ct.filterGroup
                    : ct.filterDirect}
                </span>
              </div>
              <p>{moTaHeader}</p>
            </div>
            <span className="chat-pro__top-status">
              <span className="chat-pro__top-status-dot" aria-hidden />
              {ct.live}
            </span>
          </header>

          <div ref={cuonRef} className="chat-pro__scroll">
            {tinNhan.length === 0 ? (
              <p className="chat-pro__scroll-empty">{ct.emptyGreet}</p>
            ) : (
              nhomTin.map((ngay) => (
                <div key={ngay.key}>
                  <div className="chat-pro__stamp-wrap">
                    <span className="chat-pro__stamp">{ngay.label}</span>
                  </div>
                  {ngay.items.map((msg) => {
                    const mine = laCuaToi(msg);
                    const showName =
                      !mine && hoiThoaiChon.loai === "GROUP";
                    const coMedia =
                      (msg.loai === "IMAGE" || msg.loai === "FILE") &&
                      msg.duongDanFile;
                    return (
                      <div
                        key={msg.id}
                        className={`chat-pro__row${mine ? " chat-pro__row--out" : " chat-pro__row--in"}`}
                      >
                        {!mine && (
                          <span
                            className="chat-pro__row-av"
                            aria-hidden
                          >
                            {layChuCai(msg.nguoiGuiTen)}
                          </span>
                        )}
                        <div className="chat-pro__bubble-wrap">
                          {showName && (
                            <span className="chat-pro__sender">
                              {msg.nguoiGuiTen ?? "—"}
                            </span>
                          )}
                          <div
                            className={`chat-pro__bubble${coMedia ? " chat-pro__bubble--file" : ""}`}
                          >
                            {msg.loai === "IMAGE" && msg.duongDanFile && (
                              <a
                                href={urlFile(msg.duongDanFile)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  className="chat-pro__img"
                                  src={urlFile(msg.duongDanFile)}
                                  alt={msg.tenFile ?? ct.imageAlt}
                                />
                              </a>
                            )}
                            {msg.loai === "FILE" && msg.duongDanFile && (
                              <a
                                href={urlFile(msg.duongDanFile)}
                                target="_blank"
                                rel="noreferrer"
                                className="chat-pro__file-link"
                              >
                                📎 {msg.tenFile ?? ct.downloadFile}
                                {msg.kichThuocFile != null && (
                                  <>
                                    {" "}
                                    ({Math.round(msg.kichThuocFile / 1024)}{" "}
                                    KB)
                                  </>
                                )}
                              </a>
                            )}
                            {msg.noiDung && <span>{msg.noiDung}</span>}
                          </div>
                          {msg.thoiGianGui && (
                            <time className="chat-pro__meta-time">
                              {formatGioNgan(msg.thoiGianGui, localeTag)}
                            </time>
                          )}
                          <div className="chat-pro__reacts">
                            {(msg.phanHoi ?? []).map((p) => (
                              <button
                                key={p.emoji}
                                type="button"
                                className={`chat-pro__react-chip${p.cuaToi ? " chat-pro__react-chip--on" : ""}`}
                                onClick={() =>
                                  void toggleReaction(msg.id, p.emoji)
                                }
                              >
                                {p.emoji} {p.soLuong}
                              </button>
                            ))}
                            <span className="chat-pro__react-more">
                              {REACTION_NHANH.map((em) => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() =>
                                    void toggleReaction(msg.id, em)
                                  }
                                >
                                  {em}
                                </button>
                              ))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {moEmoji && (
            <div className="chat-pro__emoji-tray">
              {EMOJI_GUI.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => chenEmoji(em)}
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          <form className="chat-pro__compose" onSubmit={guiVanBan}>
            <div className="chat-pro__compose-inner">
              <button
                type="button"
                className="chat-pro__icon-btn"
                onClick={() => setMoEmoji((v) => !v)}
                title="Emoji"
                aria-label="Emoji"
              >
                😊
              </button>
              <button
                type="button"
                className="chat-pro__icon-btn"
                onClick={() => fileRef.current?.click()}
                title={ct.attach}
                aria-label={ct.attach}
              >
                📎
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void guiFile(f);
                }}
              />
              <textarea
                className="chat-pro__field"
                rows={1}
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                placeholder={ct.placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void guiVanBan();
                  }
                }}
              />
              <button
                type="submit"
                className="chat-pro__send-btn"
                disabled={dangGui || !noiDung.trim()}
                aria-label={ct.send}
              >
                <IconSend />
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="chat-pro__main chat-pro__main--idle">
          <div className="chat-pro__idle">
            <div className="chat-pro__idle-icon" aria-hidden>
              💬
            </div>
            <p>{ct.emptySelect}</p>
          </div>
        </section>
      )}

      {moTimNguoi && (
        <div
          className="chat-pro__overlay"
          role="presentation"
          onClick={() => setMoTimNguoi(false)}
        >
          <div
            className="chat-pro__dialog"
            role="dialog"
            aria-labelledby="chat-find-user-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="chat-find-user-title">{ct.findPersonTitle}</h3>
            <input
              placeholder={ct.searchPersonPh}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              autoFocus
            />
            <ul className="chat-pro__pick-list">
              {nguoiTim.length === 0 ? (
                <li className="text-muted" style={{ padding: "8px" }}>
                  {ct.noResults}
                </li>
              ) : (
                nguoiTim.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="chat-pro__pick-item"
                      onClick={() => void batDauChatRieng(n.id)}
                    >
                      <span
                        className="chat-pro__thread-av"
                        aria-hidden
                      >
                        {layChuCai(n.hoTen)}
                      </span>
                      <span>
                        <strong>{n.hoTen}</strong>
                        <span>
                          @{n.tenDangNhap} · {nhanVaiTro(i18n, n.vaiTro)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <button
              type="button"
              className="chat-pro__dialog-close"
              onClick={() => setMoTimNguoi(false)}
            >
              {i18n.common.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
