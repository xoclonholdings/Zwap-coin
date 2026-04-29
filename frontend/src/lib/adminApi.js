const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

async function parseResponse(res, method, endpoint) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${endpoint} failed: ${text}`);
  }

  return res.json();
}

const adminApi = {
  headers(key) {
    return {
      "X-Admin-Key": key ?? localStorage.getItem("zwap_admin_key") ?? "",
      "Content-Type": "application/json",
    };
  },

  async get(endpoint, key) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "GET",
      headers: this.headers(key),
    });

    return parseResponse(res, "GET", endpoint);
  },

  async post(endpoint, data = {}, key) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "POST",
      headers: this.headers(key),
      body: JSON.stringify(data),
    });

    return parseResponse(res, "POST", endpoint);
  },

  async put(endpoint, data = {}, key) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "PUT",
      headers: this.headers(key),
      body: JSON.stringify(data),
    });

    return parseResponse(res, "PUT", endpoint);
  },

  async delete(endpoint, key) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "DELETE",
      headers: this.headers(key),
    });

    return parseResponse(res, "DELETE", endpoint);
  },
};

export default adminApi;
