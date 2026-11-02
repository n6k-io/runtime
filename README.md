# @n6k.io/runtime

Browser app shell for n6k apps. An app's `root.tsx` is:

```tsx
export { Root as default } from "@n6k.io/runtime";
```

`Root` builds the DuckDB engine and providers (see `src/root.tsx`). `ServerPage` renders `.py` pages over the page socket's RPC.
