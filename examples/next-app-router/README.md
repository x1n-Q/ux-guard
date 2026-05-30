# next-app-router example

A miniature Next.js App Router layout to exercise uxlint's route-level awareness.

```
app/
├── dashboard/
│   ├── page.tsx      ← fetches data, has NO local loading/error UI
│   ├── loading.tsx   ← Next.js auto-renders this during Suspense
│   └── error.tsx     ← Next.js error boundary
└── settings/
    └── page.tsx      ← fetches data, has NO local UI AND no sibling loading/error
```

When you scan this with uxlint:

```bash
node packages/cli/dist/index.js scan ./examples/next-app-router
```

You should see:

- `dashboard/page.tsx` → ✅ no issues (route-level loading.tsx + error.tsx cover it)
- `settings/page.tsx`  → ❌ flagged for `missing_loading_state` AND `missing_error_state`

This is the test case for the App Router awareness feature.
