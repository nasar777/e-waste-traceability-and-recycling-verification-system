const API_BASE = "/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchContractInfo() {
  const res = await fetch(`${API_BASE}/contract/info`);
  return res.json();
}

export async function fetchAllItems() {
  const res = await fetch(`${API_BASE}/items`);
  return res.json();
}

export async function fetchItemById(id) {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}`);
  return res.json();
}

export async function fetchItemHistory(id) {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}/history`);
  return res.json();
}

export async function fetchItemCertificate(id) {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}/certificate`);
  return res.json();
}

export async function fetchQRCode(id) {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}/qr`);
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  return res.json();
}

export async function fetchRolesForAddress(address) {
  const res = await fetch(`${API_BASE}/roles/${encodeURIComponent(address)}`);
  return res.json();
}

export async function fetchPreconfiguredRoles() {
  const res = await fetch(`${API_BASE}/roles/preconfigured`);
  return res.json();
}

export async function saveItemMetadata(metadata) {
  const res = await fetch(`${API_BASE}/items/cache`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  return res.json();
}
