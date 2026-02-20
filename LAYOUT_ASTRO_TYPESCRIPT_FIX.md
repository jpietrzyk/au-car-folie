# Layout.astro TypeScript Fix

## Issue

**File**: [`src/layouts/Layout.astro`](src/layouts/Layout.astro:188)

**Error**: TypeScript error TS2709 - "Cannot use namespace 'globalThis' as a type."

## Problem Description

The code was using `globalThis` as a type in type assertions on lines 188 and 192:

```astro
(window as Window & globalThis).requestIdleCallback(initWhenIdle, {
  timeout: 1200,
});
```

```astro
(window as Window & globalThis).setTimeout(initWhenIdle, 0);
```

This caused a TypeScript compilation error because `globalThis` is a global object reference in JavaScript/TypeScript, not a type itself. When you want to use it in a type context (like in an intersection type), you need to use `typeof globalThis` to get its type.

## Fix Applied

Changed `globalThis` to `typeof globalThis` in both type assertions:

```astro
(window as Window & typeof globalThis).requestIdleCallback(initWhenIdle, {
  timeout: 1200,
});
```

```astro
(window as Window & typeof globalThis).setTimeout(initWhenIdle, 0);
```

## Why This Works

- `globalThis` is a global object that provides a standard way to access the global `this` value across environments
- When used in a type context, TypeScript expects a type, not a value
- `typeof globalThis` tells TypeScript to use the type of the `globalThis` object
- The type assertion `Window & typeof globalThis` correctly indicates that the window object should have properties from both the `Window` interface and the global scope

## Benefits

- ✅ TypeScript compilation error resolved
- ✅ Maintains the same runtime behavior
- ✅ Properly typed for better type safety
- ✅ IDE autocomplete and type checking work correctly

## Verification

Run TypeScript compiler to verify no errors:

```bash
npx tsc --noEmit
```

Expected result: Exit code 0 (success)

## Related Files

- [`src/layouts/Layout.astro`](src/layouts/Layout.astro:188) - Fixed file
- [`TYPESCRIPT_AND_LIGHTBOX_FIXES.md`](TYPESCRIPT_AND_LIGHTBOX_FIXES.md) - Previous TypeScript fixes

## Date Fixed

2026-02-20
