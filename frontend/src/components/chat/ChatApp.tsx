"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api, { API_ORIGIN } from "@/lib/api";
import { getUserId, setUserId } from "@/lib/auth";
import { useToast } from "@/components/NhaCungCapToast";
import { IconSend } from "@/components/Icons";
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

const vaiTroNhan = (v?: string) => {
  switch (v) {
    case "ADMIN":
      return "Quản trị";
    case "STAFF":
      return "Nhân viên";
    case "TENANT":
      return "Khách thuê";
    default:
      return v ?? "";
  }
};

function urlFile(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
}

export default function ChatApp() {
  const [hoiThoai, setHoiThoai] = useState<HoiThoai[]>([]);
  const [hoiThoaiId, setHoiThoaiId] = useState<string | null>(null);
  const [tinNhan, setTinNhan] = useState<TinNhan[]>([]);
  const [noiDung, setNoiDung] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [moTimNguoi, setMoTimNguoi] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");
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
      } catch {
        /* ignore */
      }
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
      notify("Không tải được danh sách hội thoại.", "error");
    }
  }, [notify]);

  const taiTin = useCallback(
    async (id: string) => {
      try {
        const res = await api.get(`/hoi-thoai/${id}/tin-nhan`);
        setTinNhan(Array.isArray(res.data) ? (res.data as TinNhan[]) : []);
        await api.put(`/hoi-thoai/${id}/da-doc`);
      } catch {
        notify("Không tải được tin nhắn.", "error");
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
      notify(ax?.response?.data?.message ?? "Không tạo được hội thoại.", "error");
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
      notify(ax?.response?.data?.message ?? "Gửi tin thất bại.", "error");
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
      notify(ax?.response?.data?.message ?? "Tải file thất bại.", "error");
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
      notify("Không cập nhật được reaction.", "error");
    }
  };

  const chenEmoji = (emoji: string) => {
    setNoiDung((s) => s + emoji);
  };

  const laCuaToi = (t: TinNhan) => t.nguoiGuiId === userId;

  return (
    <div className="chat-v2">
      <aside className="chat-v2-sidebar">
        <div className="chat-v2-sidebar-head">
          <h3>Hội thoại</h3>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setMoTimNguoi(true)}
          >
            + Chat riêng
          </button>
        </div>
        <ul className="chat-v2-list">
          {hoiThoai.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className={`chat-v2-item${h.id === hoiThoaiId ? " active" : ""}`}
                onClick={() => chonHoiThoai(h.id)}
              >
                <span className="chat-v2-item-icon">
                  {h.loai === "GROUP" ? "👥" : "💬"}
                </span>
                <span className="chat-v2-item-body">
                  <strong>{h.tenHienThi ?? "Hội thoại"}</strong>
                  {h.loai === "GROUP" && h.soThanhVien != null && (
                    <small>{h.soThanhVien} thành viên</small>
                  )}
                  {h.loai === "PRIVATE" && h.doiTuongVaiTro && (
                    <small>{vaiTroNhan(h.doiTuongVaiTro)}</small>
                  )}
                  {h.tinCuoi && (
                    <span className="chat-v2-preview">{h.tinCuoi}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="chat-v2-main card chat-panel">
        {hoiThoaiChon ? (
          <>
            <header className="chat-v2-header">
              <div>
                <h2>{hoiThoaiChon.tenHienThi ?? "Chat"}</h2>
                <p className="text-muted">
                  {hoiThoaiChon.loai === "GROUP"
                    ? "Nhóm chung — mọi người dùng trong hệ thống"
                    : `Chat riêng với ${hoiThoaiChon.doiTuongTen ?? ""}`}
                </p>
              </div>
            </header>

            <div ref={cuonRef} className="chat-v2-messages">
              {tinNhan.length === 0 ? (
                <p className="text-muted">Chưa có tin nhắn. Hãy chào mọi người!</p>
              ) : (
                tinNhan.map((t) => (
                  <div
                    key={t.id}
                    className={`chat-bubble${laCuaToi(t) ? " mine" : ""}`}
                  >
                    <div className="chat-bubble-meta">
                      <strong>{t.nguoiGuiTen ?? "—"}</strong>
                      {t.nguoiGuiVaiTro && (
                        <span className="chat-v2-role">
                          {vaiTroNhan(t.nguoiGuiVaiTro)}
                        </span>
                      )}
                      {t.thoiGianGui && (
                        <span>
                          {new Date(t.thoiGianGui).toLocaleString("vi-VN")}
                        </span>
                      )}
                    </div>

                    {t.loai === "IMAGE" && t.duongDanFile && (
                      <a
                        href={urlFile(t.duongDanFile)}
                        target="_blank"
                        rel="noreferrer"
                        className="chat-v2-image-wrap"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlFile(t.duongDanFile)}
                          alt={t.tenFile ?? "Ảnh"}
                        />
                      </a>
                    )}

                    {t.loai === "FILE" && t.duongDanFile && (
                      <a
                        href={urlFile(t.duongDanFile)}
                        target="_blank"
                        rel="noreferrer"
                        className="chat-v2-file"
                      >
                        📎 {t.tenFile ?? "Tải file"}
                        {t.kichThuocFile != null && (
                          <small>
                            {" "}
                            ({Math.round(t.kichThuocFile / 1024)} KB)
                          </small>
                        )}
                      </a>
                    )}

                    {t.noiDung && (
                      <div className="chat-v2-text">{t.noiDung}</div>
                    )}

                    <div className="chat-v2-reactions">
                      {(t.phanHoi ?? []).map((p) => (
                        <button
                          key={p.emoji}
                          type="button"
                          className={`chat-v2-reaction${p.cuaToi ? " active" : ""}`}
                          onClick={() => void toggleReaction(t.id, p.emoji)}
                          title="Bỏ/chọn reaction"
                        >
                          {p.emoji} {p.soLuong}
                        </button>
                      ))}
                      <div className="chat-v2-react-quick">
                        {REACTION_NHANH.map((em) => (
                          <button
                            key={em}
                            type="button"
                            className="chat-v2-react-btn"
                            onClick={() => void toggleReaction(t.id, em)}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {moEmoji && (
              <div className="chat-v2-emoji-picker">
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

            <form className="chat-v2-compose" onSubmit={guiVanBan}>
              <div className="chat-v2-toolbar">
                <button
                  type="button"
                  className="chat-v2-tool"
                  onClick={() => setMoEmoji((v) => !v)}
                  title="Emoji"
                >
                  😊
                </button>
                <button
                  type="button"
                  className="chat-v2-tool"
                  onClick={() => fileRef.current?.click()}
                  title="Ảnh / file"
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
              </div>
              <textarea
                rows={2}
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                placeholder="Nhập tin nhắn… (Enter gửi, Shift+Enter xuống dòng)"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void guiVanBan();
                  }
                }}
              />
              <button type="submit" className="btn" disabled={dangGui}>
                <IconSend /> {dangGui ? "Đang gửi…" : "Gửi"}
              </button>
            </form>
          </>
        ) : (
          <p className="text-muted">Chọn hoặc tạo hội thoại.</p>
        )}
      </main>

      {moTimNguoi && (
        <div
          className="chat-v2-modal-backdrop"
          role="presentation"
          onClick={() => setMoTimNguoi(false)}
        >
          <div
            className="chat-v2-modal card"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Tìm người để chat riêng</h3>
            <input
              placeholder="Tìm theo tên hoặc tên đăng nhập…"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              autoFocus
            />
            <ul className="chat-v2-user-list">
              {nguoiTim.length === 0 ? (
                <li className="text-muted">Không có kết quả.</li>
              ) : (
                nguoiTim.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="chat-v2-user-item"
                      onClick={() => void batDauChatRieng(n.id)}
                    >
                      <strong>{n.hoTen}</strong>
                      <span>
                        @{n.tenDangNhap} · {vaiTroNhan(n.vaiTro)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setMoTimNguoi(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
