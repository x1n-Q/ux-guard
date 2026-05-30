import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  buildRouteContext,
  RouteContextCache,
} from "../src/route-context";

let tmp: string;

beforeAll(() => {
  // os.tmpdir() may not be writable in some sandboxes (e.g. Termux /tmp is RO).
  // Fall back to a hidden dir in HOME so the suite still runs.
  const candidates = [os.tmpdir(), path.join(os.homedir(), ".ux-guard-test-tmp")];
  for (const base of candidates) {
    try {
      fs.mkdirSync(base, { recursive: true });
      tmp = fs.mkdtempSync(path.join(base, "ux-guard-route-"));
      return;
    } catch {
      // try next candidate
    }
  }
  throw new Error("Could not create a writable temp directory for tests");
});

afterAll(() => {
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

function writeFile(p: string, content = "") {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
}

describe("buildRouteContext", () => {
  it("returns isAppRouter:false for files outside an app/ directory", () => {
    const file = path.join(tmp, "case-non-app/src/components/Foo.tsx");
    writeFile(file, "export const Foo = () => null;");
    const ctx = buildRouteContext(file, tmp);
    expect(ctx.isAppRouter).toBe(false);
    expect(ctx.hasLoadingFile).toBe(false);
    expect(ctx.hasErrorFile).toBe(false);
  });

  it("detects a loading.tsx in the same segment", () => {
    const dir = path.join(tmp, "case-same/app/dashboard");
    writeFile(path.join(dir, "page.tsx"));
    writeFile(path.join(dir, "loading.tsx"));
    const ctx = buildRouteContext(path.join(dir, "page.tsx"), tmp);
    expect(ctx.isAppRouter).toBe(true);
    expect(ctx.hasLoadingFile).toBe(true);
    expect(ctx.hasErrorFile).toBe(false);
  });

  it("inherits loading.tsx from an ancestor segment", () => {
    const root = path.join(tmp, "case-inherit");
    writeFile(path.join(root, "app/loading.tsx"));
    const page = path.join(root, "app/users/list/page.tsx");
    writeFile(page);
    const ctx = buildRouteContext(page, tmp);
    expect(ctx.isAppRouter).toBe(true);
    expect(ctx.hasLoadingFile).toBe(true);
  });

  it("detects error.tsx and not-found.tsx", () => {
    const dir = path.join(tmp, "case-error/app/account");
    writeFile(path.join(dir, "page.tsx"));
    writeFile(path.join(dir, "error.tsx"));
    writeFile(path.join(dir, "not-found.tsx"));
    const ctx = buildRouteContext(path.join(dir, "page.tsx"), tmp);
    expect(ctx.hasErrorFile).toBe(true);
    expect(ctx.hasNotFoundFile).toBe(true);
  });

  it("supports .jsx and .js (not just .tsx)", () => {
    const dir = path.join(tmp, "case-jsx/app/jsx-only");
    writeFile(path.join(dir, "page.jsx"));
    writeFile(path.join(dir, "loading.jsx"));
    const ctx = buildRouteContext(path.join(dir, "page.jsx"), tmp);
    expect(ctx.hasLoadingFile).toBe(true);
  });

  it("does not falsely match a directory named my-app", () => {
    const dir = path.join(tmp, "case-suffix/my-app/components");
    writeFile(path.join(dir, "Foo.tsx"));
    writeFile(path.join(tmp, "case-suffix/my-app/loading.tsx"));
    const ctx = buildRouteContext(path.join(dir, "Foo.tsx"), tmp);
    expect(ctx.isAppRouter).toBe(false);
    expect(ctx.hasLoadingFile).toBe(false);
  });
});

describe("RouteContextCache", () => {
  it("returns equal contexts for files in the same directory (cached)", () => {
    const dir = path.join(tmp, "case-cache/app/dash");
    writeFile(path.join(dir, "page.tsx"));
    writeFile(path.join(dir, "loading.tsx"));
    writeFile(path.join(dir, "OtherClient.tsx"));
    const cache = new RouteContextCache(tmp);
    const a = cache.get(path.join(dir, "page.tsx"));
    const b = cache.get(path.join(dir, "OtherClient.tsx"));
    expect(a).toBe(b);
  });
});
