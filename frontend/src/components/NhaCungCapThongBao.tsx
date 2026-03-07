"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import {
  createNotificationClient,
  type NotificationPayload,
} from "@/lib/notificationSocket";
import { useToast } from "./NhaCungCapToast";

type GiaTriNgonNguThongBao = {
  unreadCount: number;
  refetchUnread: () => Promise<void>;
  lastIncoming: NotificationPayload | null;
  clearLastIncoming: () => void;
};

const NgonNguThongBao = createContext<GiaTriNgonNguThongBao | null>(null);

export function useThongBao() {
  const ctx = useContext(NgonNguThongBao);
  return ctx;
}

/** Provider thông báo: đếm chưa đọc, lắng nghe WebSocket, hiển thị toast khi có thông báo mới. */
export default function NhaCungCapThongBao({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notify } = useToast();
  const [daMount, setDaMount] = useState(false);
  const [soChuaDoc, setSoChuaDoc] = useState(0);
  const [moiNhat, setMoiNhat] = useState<NotificationPayload | null>(null);
  const refClient = useRef<ReturnType<typeof createNotificationClient>>(null);

  const taiLaiChuaDoc = useCallback(
    async (danhSach?: { readFlag?: boolean }[]) => {
      try {
        if (danhSach) {
          const so = danhSach.filter((n) => !n.readFlag).length;
          setSoChuaDoc(so);
          return;
        }
        const res = await api.get("/thong-bao");
        const duLieu = res.data || [];
        setSoChuaDoc(
          duLieu.filter((n: { readFlag?: boolean }) => !n.readFlag).length,
        );
      } catch {
        setSoChuaDoc(0);
      }
    },
    [],
  );

  const xoaMoiNhat = useCallback(() => setMoiNhat(null), []);

  const giaTri = useMemo(
    () => ({
      unreadCount: soChuaDoc,
      refetchUnread: taiLaiChuaDoc,
      lastIncoming: moiNhat,
      clearLastIncoming: xoaMoiNhat,
    }),
    [soChuaDoc, taiLaiChuaDoc, moiNhat, xoaMoiNhat],
  );

  useEffect(() => {
    setDaMount(true);
  }, []);

  useEffect(() => {
    if (!daMount) return;
    const vaiTro = getRole();
    if (vaiTro !== "TENANT" && vaiTro !== "STAFF") return;

    taiLaiChuaDoc();

    const client = createNotificationClient(
      (payload: NotificationPayload) => {
        setMoiNhat(payload);
        setSoChuaDoc((c) => c + 1);
        const vanBan =
          payload.message.slice(0, 50) +
          (payload.message.length > 50 ? "…" : "");
        notify("Thông báo mới: " + vanBan, "info");
      },
      () => {},
      () => {},
    );
    if (client) {
      client.activate();
      refClient.current = client;
    }
    return () => {
      refClient.current?.deactivate?.();
      refClient.current = null;
    };
  }, [daMount, notify, taiLaiChuaDoc]);

  return (
    <NgonNguThongBao.Provider value={giaTri}>
      {children}
    </NgonNguThongBao.Provider>
  );
}
