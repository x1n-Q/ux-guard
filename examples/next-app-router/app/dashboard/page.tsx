// This page intentionally has NO local isLoading / error UI.
// uxlint should NOT flag it because `loading.tsx` and `error.tsx`
// sit in the same route segment and Next.js renders them automatically.
import React from "react";

async function getStats() {
  const res = await fetch("https://api.example.com/stats", { cache: "no-store" });
  if (!res.ok) throw new Error("Stats unavailable");
  return res.json() as Promise<{ users: number; orders: number }>;
}

export default async function DashboardPage() {
  const stats = await getStats();
  return (
    <main>
      <h1>Dashboard</h1>
      <ul>
        <li>Users: {stats.users}</li>
        <li>Orders: {stats.orders}</li>
      </ul>
    </main>
  );
}
