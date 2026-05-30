# react-sample

A tiny set of components used to exercise `uxlint` rules.

| File          | Intentional gaps                                              |
| ------------- | ------------------------------------------------------------- |
| `BadList.tsx` | missing loading, empty, error states                          |
| `BadForm.tsx` | missing validation, disabled submit, success feedback         |
| `BadFetch.tsx`| missing loading, empty, error states                          |
| `GoodList.tsx`| handles loading + empty + error correctly                     |
| `GoodForm.tsx`| handles validation + disabled submit + success feedback       |

Run from the repo root:

```bash
node packages/cli/dist/index.js scan ./examples/react-sample
```
