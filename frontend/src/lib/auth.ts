/** Khóa lưu token JWT trong localStorage */
export const TOKEN_KEY = "motel_token";
/** Khóa lưu vai trò (ADMIN/STAFF/TENANT) */
export const ROLE_KEY = "motel_role";
/** Khóa lưu họ tên hiển thị */
export const NAME_KEY = "motel_name";

/** Lấy token từ localStorage (trả về null nếu chạy phía server). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Lưu token, vai trò và họ tên sau khi đăng nhập thành công. */
export function setAuth(token: string, role: string, name: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(NAME_KEY, name);
}

/** Xóa toàn bộ dữ liệu đăng nhập (đăng xuất). */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
}

/** Lấy vai trò hiện tại. */
export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}

/** Lấy họ tên người dùng hiện tại. */
export function getName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}
