Managing a monorepo well comes down to a few key areas. Here's what to watch out for:

## Package boundaries & dependency declarations

Every package must declare its dependencies explicitly in its own `package.json` — never rely on hoisting to make a transitive dependency available. If `app-a` uses `lodash` but only `lib-b` declares it, you'll get phantom dependencies that break in CI or when hoisting behavior changes.

## Sharing types between packages

This is where most teams hit friction:

**Publish types as a proper package.** Create a dedicated package like `@myorg/types` with its own `package.json`. Other packages declare it as a dependency explicitly.

**Watch your `tsconfig.json` paths.** In each consuming package, you reference the types package — not a relative path across workspace boundaries. Use workspace protocol:

```json
// package.json
{ "dependencies": { "@myorg/types": "workspace:*" } }
```

**Decide: source or compiled?** You have two models:

- **Source references** (via `tsconfig` project references): faster builds, but requires careful `paths` config and TypeScript `composite: true`
- **Compiled output**: each package builds to `dist/`, consumers import from there. More reliable but needs a build step before type-checking dependents

Project references are generally the right call for type-sharing. Each package gets:

```json
// tsconfig.json
{
  "compilerOptions": { "composite": true, "declaration": true },
  "references": [{ "path": "../types" }]
}
```

**Set `exports` in `package.json` correctly.** Modern Node/bundlers require explicit exports:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

## Build order & caching

You need a task runner that understands the dependency graph — **Turborepo** or **Nx** are the standard choices. Without one, you'll run builds in wrong order and waste time rebuilding unchanged packages.

In `turbo.json`:

```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "typecheck": { "dependsOn": ["^build"] }
  }
}
```

The `^build` means "build my dependencies first." Caching means unchanged packages are skipped entirely.

## Version consistency

**Single version policy** (recommended): one version of each third-party dep across the entire repo. Tools like `syncpack` help enforce this. Mismatched versions of React, for example, cause runtime errors that are hard to debug.

**Peer dependencies**: shared UI libraries should declare React (and similar) as `peerDependencies`, not `dependencies`, to avoid bundling multiple copies.

## Common pitfalls

- **Circular dependencies** between packages — use `madge` or `depcruise` to detect them early; they cause mysterious build failures
- **Forgetting to rebuild** when a shared package changes — your task runner handles this, but if you run things manually you'll get stale types
- **Jest / Vitest module resolution** — test runners often need separate `moduleNameMapper` or `resolve.alias` config to understand workspace packages, since they don't always respect `exports`
- **`.d.ts` files missing from published output** — double-check your `include`/`exclude` in `tsconfig` and that `declaration: true` is set

## A minimal mental model

Think of each package as if it were a separate npm package you'd publish. It should build independently, declare all its deps, and expose a clean public API. If you can't `npm pack` it in isolation, something's wrong with your boundaries.
