// Intentionally bad: async + .then with no loading/error UI.
import React, { useEffect, useState } from "react";

type Item = { id: string; title: string };

export function BadFetch() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  return (
    <section>
      <h2>Items</h2>
      <div>
        {items.map((i) => (
          <article key={i.id}>{i.title}</article>
        ))}
      </div>
    </section>
  );
}
