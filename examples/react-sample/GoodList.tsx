// Properly handles loading, empty, error.
import React, { useEffect, useState } from "react";

type User = { id: string; name: string };

export function GoodList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed");
        const data = (await res.json()) as User[];
        if (!cancelled) setUsers(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div role="alert">Something went wrong: {error}</div>;
  if (users.length === 0) return <div>No users yet.</div>;

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
