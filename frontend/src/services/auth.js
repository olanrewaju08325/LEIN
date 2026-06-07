const BASE = "http://localhost:8000";

async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.detail || "Request failed");
  }
  return data;
}

function saveSession(data) {
  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("refresh_token", data.refresh_token);
  sessionStorage.setItem("user", JSON.stringify(data.user));
}

export async function register(email, password, full_name, profile = {}) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      full_name,
      username: profile.username,
      phone_number: profile.phone_number,
      address: profile.address,
      role: profile.role || "dispatcher",
      organisation: profile.organisation,
      terms_accepted: Boolean(profile.terms_accepted),
      authority_confirmed: Boolean(profile.authority_confirmed),
      updates_opt_in: Boolean(profile.updates_opt_in),
    }),
  });
  return readJson(res);
}

export async function verifyOTP(email, token) {
  const res = await fetch(`${BASE}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, token }),
  });
  const data = await readJson(res);
  saveSession(data);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await readJson(res);
  saveSession(data);
  return data;
}

export async function resendOTP(email) {
  const res = await fetch(`${BASE}/auth/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  return readJson(res);
}

export function logout() {
  const token = sessionStorage.getItem("access_token");
  fetch(`${BASE}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => {});
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
}

export function getToken() {
  return sessionStorage.getItem("access_token");
}

export function getUser() {
  const u = sessionStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export function getUserRole() {
  const user = getUser();
  return user?.role || null;
}

export function isDispatcher() {
  return getUserRole() === "dispatcher";
}

export function isCitizen() {
  return getUserRole() === "citizen";
}

export function isAuthenticated() {
  return !!sessionStorage.getItem("access_token");
}
