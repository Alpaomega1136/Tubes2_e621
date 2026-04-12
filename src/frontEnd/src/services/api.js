// Base URL untuk koneksi frontend ke backend C#
const BASE_URL = "http://localhost:5027";

// Memanggil API backend untuk mendapatkan pohon DOM (dari URL atau HTML mentah)
export async function scrapeHtml({ url, html }) {
  const res = await fetch(`${BASE_URL}/api/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url || null, html: html || null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.Error || err.error || "Scrape failed (Backend Error)");
  }
  return res.json();
}

// Algoritma pencarian (BFS/DFS) berdasarkan CSS selector
export async function traverseDom({ url, html, selector, algorithm, maxResults }) {
  const res = await fetch(`${BASE_URL}/api/traverse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: url || null,
      html: html || null,
      selector,
      algorithm,
      maxResults: maxResults || null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.Error || err.error || "Traversal failed (Backend Error)");
  }
  return res.json();
}

