import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "./auth";

const WS_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "https" : "http"}://${window.location.hostname}:8080/ws`
    : "";

export type NotificationPayload = {
  id: string | number;
  message: string;
  readFlag: boolean;
  sentAt: string | null;
};

export function createNotificationClient(
  onNotification: (n: NotificationPayload) => void,
  onConnect?: () => void,
  onError?: (err: unknown) => void,
) {
  const token = getToken();
  if (!token || !WS_URL) return null;

  const client = new Client({
    /** Cross-origin (FE :4002 → BE :8080): không gửi cookie trên XHR SockJS — tránh CORS bắt `Allow-Credentials: true`. JWT vẫn gửi qua header STOMP `connectHeaders`. */
    webSocketFactory: () =>
      new SockJS(WS_URL, undefined, {
        withCredentials: false,
      }) as unknown as WebSocket,
    connectHeaders: { token },
    onConnect: () => {
      client.subscribe("/user/queue/notifications", (msg) => {
        try {
          const body = JSON.parse(msg.body) as NotificationPayload;
          onNotification(body);
        } catch {
          // ignore parse error
        }
      });
      onConnect?.();
    },
    onStompError: (frame) => {
      onError?.(frame);
    },
  });

  return client;
}
