import { useSyncExternalStore } from "react";
import type { N6kDuckDB } from "@n6k.io/db";

export function ConnectionLost({ duckdb }: { duckdb: N6kDuckDB }) {
  const { connStatus } = useSyncExternalStore(
    duckdb.subscribe,
    duckdb.getSnapshot,
    duckdb.getSnapshot,
  );
  const lost = Object.values(connStatus).some(
    (s) => s === "disconnected" || s === "reconnecting",
  );
  if (!lost) return null;
  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-50 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-white shadow"
    >
      Connection lost — reconnecting…
    </div>
  );
}
