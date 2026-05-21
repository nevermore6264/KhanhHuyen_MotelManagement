import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "./auth";
import { API_ORIGIN } from "./api";

export type ChatSocketPayload = {
  loaiSuKien?: string;
  hoiThoaiId?: string;
  tinNhan?: unknown;
};

export type ChatSocketHandlers = {
  onError?: (err: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
};

function layWsUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    return `${new URL(API_ORIGIN).origin}/ws`;
  } catch {
    const proto = window.location.protocol === "https:" ? "https" : "http";
    return `${proto}://${window.location.hostname}:8080/ws`;
  }
}

export function createChatClient(
  onMessage: (payload: ChatSocketPayload) => void,
  handlers?: ChatSocketHandlers,
): Client | null {
  const token = getToken();
  const wsUrl = layWsUrl();
  if (!token || !wsUrl) return null;

  const client = new Client({
    webSocketFactory: () =>
      new SockJS(wsUrl, undefined, {
        withCredentials: false,
      }) as unknown as WebSocket,
    connectHeaders: { token },
    reconnectDelay: 2000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe("/user/queue/chat", (msg) => {
        try {
          const body = JSON.parse(msg.body) as ChatSocketPayload;
          onMessage(body);
        } catch {
          onMessage({});
        }
      });
      handlers?.onConnect?.();
    },
    onDisconnect: () => {
      handlers?.onDisconnect?.();
    },
    onStompError: (frame) => {
      handlers?.onError?.(frame);
    },
    onWebSocketClose: () => {
      handlers?.onDisconnect?.();
    },
  });

  return client;
}
