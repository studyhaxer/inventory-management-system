const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* no JSON body */ }

  if (!res.ok) {
    const message = data?.detail || `Request failed with status ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

function toQueryString(params = {}) {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

function crud(resource) {
  return {
    list: (token, params) => request(`/${resource}${toQueryString(params)}`, { token }),
    create: (token, payload) => request(`/${resource}`, { method: "POST", body: payload, token }),
    update: (token, id, payload) => request(`/${resource}/${id}`, { method: "PUT", body: payload, token }),
    remove: (token, id) => request(`/${resource}/${id}`, { method: "DELETE", token }),
  };
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),
  dashboardSummary: (token) => request("/dashboard/summary", { token }),
  categories: crud("categories"),
  suppliers: crud("suppliers"),
  products: crud("products"),
};