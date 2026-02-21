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
import { useToast } from "./ToastProvider";

type NotificationContextValue = {
  unreadCount: number;
  refetchUnread: () => Promise<void>;
  lastIncoming: NotificationPayload | null;
  clearLastIncoming: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  return ctx;
}

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { notify } = useToast();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastIncoming, setLastIncoming] = useState<NotificationPayload | null>(
    null,
  );
  const clientRef = useRef<ReturnType<typeof createNotificationClient>>(null);

  const refetchUnread = useCallback(async (list?: { readFlag?: boolean }[]) => {
    try {
      if (list) {
        const count = list.filter((n) => !n.readFlag).length;
        setUnreadCount(count);
        return;
      }
      const res = await api.get("/notifications");
      const data = res.data || [];
      setUnreadCount(
        data.filter((n: { readFlag?: boolean }) => !n.readFlag).length,
      );
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const clearLastIncoming = useCallback(() => setLastIncoming(null), []);

  const value = useMemo(
    () => ({
      unreadCount,
      refetchUnread,
      lastIncoming,
      clearLastIncoming,
    }),
    [unreadCount, refetchUnread, lastIncoming, clearLastIncoming],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const role = getRole();
    if (role !== "TENANT" && role !== "STAFF") return;

    refetchUnread();

    const client = createNotificationClient(
      (payload: NotificationPayload) => {
        setLastIncoming(payload);
        setUnreadCount((c) => c + 1);
        const text =
          payload.message.slice(0, 50) +
          (payload.message.length > 50 ? "…" : "");
        notify("Thông báo mới: " + text, "info");
      },
      () => {},
      () => {},
    );
    if (client) {
      client.activate();
      clientRef.current = client;
    }
    return () => {
      clientRef.current?.deactivate?.();
      clientRef.current = null;
    };
  }, [mounted, notify, refetchUnread]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
