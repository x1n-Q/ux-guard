# ux-guard rules

All rules are AST + heuristic based. They aim for **low false positives** — they
only flag a problem when async/data/form patterns clearly exist *and* the
corresponding UX state is clearly missing.

| Config key         | Rule id                       | Default | What it checks                                                                 |
| ------------------ | ----------------------------- | ------- | ------------------------------------------------------------------------------ |
| `loadingState`     | `missing_loading_state`       | `warn`  | File fetches data (`fetch`, `useQuery`, `useSWR`, ...) but never renders a loading UI. |
| `emptyState`       | `missing_empty_state`         | `warn`  | A list is rendered with `.map()` in JSX with no empty/length guard.            |
| `errorState`       | `missing_error_state`         | `error` | Async logic exists with no `catch`, no `error` state, no error UI.             |
| `formValidation`   | `missing_form_validation`     | `error` | `<form>` with `<input>` and submit, but no `error` / `invalid` / `required` props. |
| `disabledSubmit`   | `missing_disabled_submit`     | `warn`  | `<button type="submit">` with no `disabled` prop.                              |
| `successFeedback`  | `missing_success_feedback`    | `warn`  | A submit/save/create/... handler runs but no toast / redirect / message.       |

## Severity & scoring

Score starts at 100. Each issue subtracts:

- `error` → **−15**
- `warn` → **−8**
- `info` → **−3**

Floor at 0.

## Disabling rules

In `ux-guard.config.{js,json,ts}`:

```js
module.exports = {
  rules: {
    successFeedback: "off",
    emptyState: "info",
  },
};
```

## Adding custom rules

Coming in v0.3 — see `packages/core/src/rules/*.ts` for the rule shape.
