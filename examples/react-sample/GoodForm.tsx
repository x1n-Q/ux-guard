// Properly handles validation, disabled submit, success feedback.
import React, { useState } from "react";

export function GoodForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Signup failed");
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) return <div role="status">Thanks! Check your inbox.</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        aria-invalid={!!error}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      {error ? (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing up…" : "Sign up"}
      </button>
    </form>
  );
}
