import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "./auth";
import { API_ORIGIN } from "./api";

export type ChatSocketPayload = {
  loaiSuKien?: string;
  hoiThoaiId?: string;
  tinNhan?: unknown;
};

const WS_URL =
  typeof window !== "undefined" ? `${API_ORIGIN}/ws` : "";

export function createChatClient(
  onMessage: (payload: ChatSocketPayload) => void,
  onError?: (err: unknown) => void,
): Client | null {
  const token = getToken();
  if (!token || !WS_URL) return null;

  const client = new Client({
    webSocketFactory: () =>
      new SockJS(WS_URL, undefined, {
        withCredentials: false,
      }) as unknown as WebSocket,
    connectHeaders: { token },
    reconnectDelay: 5000,
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
    },
    onStompError: (frame) => {
      onError?.(frame);
    },
  });

  return client;
}
