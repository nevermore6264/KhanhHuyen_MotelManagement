
export const TOKEN_KEY = "motel_token";

export const ROLE_KEY = "motel_role";

export const NAME_KEY = "motel_name";

export const USER_ID_KEY = "motel_user_id";


export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}


export function setAuth(
  token: string,
  role: string,
  name: string,
  userId?: string,
) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(NAME_KEY, name);
  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId);
  }
}


export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

let ngatKetNoiRealtime: (() => void) | null = null;

export function dangKyNgatKetNoiRealtime(ham: () => void) {
  ngatKetNoiRealtime = ham;
}

export function dangXuatApp() {
  if (typeof window === "undefined") return;
  try {
    ngatKetNoiRealtime?.();
  } catch {
    /* ignore */
  }
  clearAuth();
  window.location.replace("/dang-nhap");
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id: string) {
  localStorage.setItem(USER_ID_KEY, id);
}


export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}


export function getName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}
