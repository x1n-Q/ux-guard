# Next.js App Router awareness

ux-guard understands how the **Next.js App Router** handles UX states at the
route level and won't double-flag pages that are already covered.

## How it works

For every file ux-guard scans, it walks **up** from the file's directory until
it finds an `app/` directory. At each segment along the way it checks for
sibling files that Next.js renders automatically:

| Sibling file        | Covers rule              |
| ------------------- | ------------------------ |
| `loading.{tsx,jsx,ts,js}`   | `missing_loading_state` |
| `error.{tsx,jsx,ts,js}`     | `missing_error_state`   |
| `not-found.{tsx,jsx,ts,js}` | _(informational only)_  |

These files are **inherited** by descendant segments. So
`app/loading.tsx` covers every page below `app/`, just like Next.js does
at runtime.

## Example

```
app/
├── dashboard/
│   ├── page.tsx       ← async fetch, no isLoading / try-catch
│   ├── loading.tsx    ← ✓ covers Suspense
│   └── error.tsx      ← ✓ covers thrown errors
└── settings/
    └── page.tsx       ← async fetch, no isLoading, no sibling loading.tsx
```

Result:

- `dashboard/page.tsx` → **silent** (route segment handles loading + error)
- `settings/page.tsx`  → **flagged** for both `missing_loading_state` and
  `missing_error_state`

Try it:

```bash
node packages/cli/dist/index.js scan ./examples/next-app-router
```

## When it does NOT apply

- **Pages Router** projects (`pages/`) — ux-guard treats them like normal
  React files and applies all rules.
- **Files that aren't inside any `app/` directory** — same.
- **`app-shell/`, `my-app/`, `web-app/` directories** — only a directory
  named **exactly `app`** counts. We don't false-match suffixes/prefixes.

## Caching

ux-guard caches the route lookup per-directory during a single scan, so
even thousand-file repos pay only a handful of `fs.existsSync` calls.
