#!/usr/bin/env node
/**
 * External keep-alive: hit /api/ping on an interval.
 * Usage:
 *   node scripts/keep-alive.mjs https://your-app.onrender.com
 *   STUDIO_URL=https://your-app.onrender.com node scripts/keep-alive.mjs
 * Interval (ms): KEEPALIVE_MS (default 600000 = 10m)
 */
const base = (process.argv[2] || process.env.STUDIO_URL || "").replace(/\/$/, "");
const everyMs = Number(process.env.KEEPALIVE_MS || 600_000);

if (!base) {
  console.error("Usage: node scripts/keep-alive.mjs <https://your-app.onrender.com>");
  process.exit(1);
}

const url = `${base}/api/ping`;

async function ping() {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method: "GET" });
    const body = await res.text();
    console.log(`${new Date().toISOString()} ${res.status} ${body.trim()} (${Date.now() - t0}ms)`);
  } catch (e) {
    console.error(`${new Date().toISOString()} FAIL ${e.message}`);
  }
}

console.log(`keep-alive → ${url} every ${everyMs}ms`);
await ping();
setInterval(ping, everyMs);
