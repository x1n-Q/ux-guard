// Intentionally bad: no validation messages, no disabled submit, no success feedback.
import React, { useState } from "react";

export function BadForm() {
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Sign up</button>
    </form>
  );
}
