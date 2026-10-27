# `sb.mock(..., { spy: true })` differs between the Vitest runner and Storybook dev/build

`sb.mock(import("../src/module.ts"), { spy: true })` in `.storybook/preview.ts` behaves differently depending on where the story runs:

| Story | `pnpm test` (Vitest addon) | `pnpm storybook` / `pnpm check:build` |
|---|---|---|
| `ArrayPropertyOnFunction`: reads `fn.list` (`["a", "b"]`) | passes | renders `list: []` |
| `ClassConstructor`: `new Thing(1)` | passes | `TypeError: Class constructor Thing cannot be invoked without 'new'` |

Versions: `storybook` / `@storybook/react-vite` / `@storybook/addon-vitest` 10.6.2, `vitest` 4.1.12, Node 24.

## Reproduce

```sh
pnpm install
pnpm test          # both stories pass
pnpm check:build   # builds Storybook, renders both stories in Chromium, both FAIL
pnpm storybook     # open SpyMock stories: same failures as the build
```

## Cause

The Vitest runner uses its own `@vitest/mocker` / `@vitest/spy` 4.x. Storybook dev and build use copies of `@vitest/mocker` / `@vitest/spy` 3.2.4 bundled into `storybook/dist`:

- `mockObject` in `dist/mocking-utils/mocker-runtime.js` replaces every array property with `[]`, even in spy mode. Vitest 4 copies arrays when spying.
- The spy calls the original implementation with `.apply(this, args)` even when called with `new`. This happens in two places: `mockCall` (bundled `@vitest/spy`) and `listenWhenCalled` (Storybook's own wrapper), both in `dist/test/index.js` and `dist/preview/runtime.js`.
