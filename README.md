# @n6k.io/runtime

Browser app shell for n6k apps. An app's `root.tsx` is:

```tsx
export { Root as default } from "@n6k.io/runtime";
```

`Root` builds one `N6kDuckDB` per page from the page's `attach`, and wraps the page in `QueryProvider` → `DuckDBProvider` → `PageSocket` → `DuckDBConnectionGuard`. `ServerPage` renders `.py` pages over the page socket's RPC.
