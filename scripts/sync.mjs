/**
 * Force une synchronisation API → BDD via POST /api/sync
 * Usage : npm run sync
 * Prérequis : serveur Next.js démarré (npm run dev)
 */
const baseUrl = process.env.SYNC_URL ?? "http://localhost:3000";
const secret = process.env.SYNC_SECRET ?? "";

const headers = { "Content-Type": "application/json" };
if (secret) headers.Authorization = `Bearer ${secret}`;

const res = await fetch(`${baseUrl}/api/sync`, { method: "POST", headers });

const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Sync échouée:", res.status, body);
  process.exit(1);
}

console.log("Sync OK:", body);
