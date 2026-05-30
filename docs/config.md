# Configuration

Create a config file at the root of your project:

```bash
npx uxaudit init        # creates uxaudit.config.ts
npx uxaudit init --js   # creates uxaudit.config.js
```

## Shape

```ts
export default {
  framework: "react" | "nextjs",
  include: string[],   // glob patterns relative to scan target
  exclude: string[],   // glob patterns
  rules: {
    loadingState:    "off" | "info" | "warn" | "error",
    emptyState:      "off" | "info" | "warn" | "error",
    errorState:      "off" | "info" | "warn" | "error",
    formValidation:  "off" | "info" | "warn" | "error",
    disabledSubmit:  "off" | "info" | "warn" | "error",
    successFeedback: "off" | "info" | "warn" | "error",
  },
};
```

## Defaults

```js
{
  framework: "react",
  include: ["src/**/*.{tsx,jsx,ts,js}"],
  exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/build/**"],
  rules: {
    loadingState: "warn",
    emptyState: "warn",
    errorState: "error",
    formValidation: "error",
    disabledSubmit: "warn",
    successFeedback: "warn",
  },
}
```

## Notes

- In the MVP, `.js`, `.cjs`, and `.json` configs are loaded directly.
  TypeScript configs (`uxaudit.config.ts`) are recognized but currently fall back
  to defaults with a warning — use `--js` for now or write a `.cjs` file.
