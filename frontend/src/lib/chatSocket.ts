import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "./auth";
import { API_ORIGIN } from "./api";

export type ChatSocketPayload = {
  loaiSuKien?: string;
  hoiThoaiId?: string;
  tinNhan?: unknown;
};

export function createChatClient(
  onMessage: (payload: ChatSocketPayload) => void,
  onError: () => void,
): Client | null {
  const token = getToken();
  if (!token || typeof window === "undefined") return null;

  const client = new Client({
    webSocketFactory: () => new SockJS(`${API_ORIGIN}/ws`) as WebSocket,
    connectHeaders: { token },
    reconnectDelay: 5000,
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
    onStompError: onError,
  });

  return client;
}
