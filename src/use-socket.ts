import { useSyncExternalStore } from "react";
import type { RegisteredWebsocket } from "@n6k.io/db";

type RegistrationStore = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => { registrations: Record<string, RegisteredWebsocket> };
};

export function useSocket(
  duckdb: RegistrationStore,
  name: string,
): RegisteredWebsocket | null {
  const snapshot = useSyncExternalStore(
    duckdb.subscribe,
    duckdb.getSnapshot,
    duckdb.getSnapshot,
  );
  return snapshot.registrations[name] ?? null;
}
