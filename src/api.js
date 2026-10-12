const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const key = "arcana-session-v1";
let memoryToken = "";
export const getToken = () => {
  try {
    return localStorage.getItem(key) || memoryToken;
  } catch {
    return memoryToken;
  }
};
export const setToken = (token) => {
  memoryToken = token || "";
  try {
    token ? localStorage.setItem(key, token) : localStorage.removeItem(key);
  } catch {
    /* Private browsing can still use an in-memory session. */
  }
};

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (publicKey) headers.apikey = publicKey;
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    throw new Error(
      "网络暂时没有回应，请检查连接后重试。你的已保存进度仍会保留。",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("测评服务暂时无法连接，请稍后重试。");
  }
  if (!response.ok) {
    const error = new Error(data.error || "暂时无法完成，请重试。");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export const resultUrl = (id) =>
  `${(import.meta.env.VITE_PUBLIC_URL || `${location.origin}${import.meta.env.BASE_URL}`).replace(/\/$/, "")}/#/result/${id}`;
export const artUrl = (id) => `${import.meta.env.BASE_URL}cards/${id}.svg`;
