// Intentionally bad: no loading, no empty, no error state.
import React, { useEffect, useState } from "react";

type User = { id: string; name: string };

export function BadList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
