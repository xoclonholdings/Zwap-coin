const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

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

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GET ${endpoint} failed: ${text}`);
    }

    return res.json();
  },

  async post(endpoint, data, key) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "POST",
      headers: this.headers(key),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST ${endpoint} failed: ${text}`);
    }

    return res.json();
  },

  async put(endpoint, data, key) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "PUT",
      headers: this.headers(key),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PUT ${endpoint} failed: ${text}`);
    }

    return res.json();
  },

  async delete(endpoint, key) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "DELETE",
      headers: this.headers(key),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DELETE ${endpoint} failed: ${text}`);
    }

    return res.json();
  },
};

export default adminApi;