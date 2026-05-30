// This page also has NO local isLoading / error UI, AND there is no
// sibling loading.tsx / error.tsx in this segment.
// uxaudit SHOULD flag missing_loading_state and missing_error_state.
import React from "react";

async function getSettings() {
  const res = await fetch("https://api.example.com/settings");
  return res.json() as Promise<{ theme: string }>;
}

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <main>
      <h1>Settings</h1>
      <p>Theme: {settings.theme}</p>
    </main>
  );
}
