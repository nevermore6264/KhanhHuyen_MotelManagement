declare module "sockjs-client" {
  export default class SockJS {
    constructor(url: string, _reserved?: unknown, options?: Record<string, unknown>);
    readonly readyState: number;
    readonly url: string;
    onopen: ((ev: Event) => void) | null;
    onmessage: ((ev: MessageEvent) => void) | null;
    onclose: ((ev: CloseEvent) => void) | null;
    onerror: ((ev: Event) => void) | null;
    close(code?: number, reason?: string): void;
    send(data: string): void;
  }
}
