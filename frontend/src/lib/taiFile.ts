import api from "@/lib/api";

export async function taiFileTuApi(url: string, tenTep: string) {
  const res = await api.get(url, { responseType: "blob" });
  const blob = new Blob([res.data], {
    type: (res.headers["content-type"] as string) || "application/octet-stream",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = tenTep;
  link.click();
  URL.revokeObjectURL(link.href);
}
