// One ATTACHed catalog, keyed by its alias: `slug` is the app endpoint serving it,
// or `url` a ws(s)/n6k(s) server; `catalog` is its name there.
export type AttachSpec =
  { slug: string; catalog: string } | { url: string; catalog: string };
