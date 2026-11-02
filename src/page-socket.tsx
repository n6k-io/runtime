import { createContext, useContext, useMemo, type ReactNode } from "react";
import type {
  DatabaseSpec,
  JsonRpcClient,
  N6kDuckDB,
  SocketSpec,
} from "@n6k.io/db";
import type { AttachSpec } from "./attach-spec";
import { useSocket } from "./use-socket";

type PageSocketValue = {
  // JSON-RPC over this page's own socket; undefined while `slug` is absent from N6kDuckDB's snapshot `registrations`.
  rpc: JsonRpcClient | undefined;
  slug: string;
  attach: Record<string, AttachSpec>;
};

const PageSocketContext = createContext<PageSocketValue>({
  rpc: undefined,
  slug: "index",
  attach: {},
});

export function usePageSocket(): PageSocketValue {
  return useContext(PageSocketContext);
}

function endpointSocket(endpoint: string): SocketSpec {
  return {
    connect: () => {
      const scheme = location.protocol === "https:" ? "wss" : "ws";
      return new WebSocket(`${scheme}://${location.host}/${endpoint}/ws`);
    },
    token: "",
  };
}

export function pageSocketProps(
  slug: string,
  attach: Record<string, AttachSpec>,
): {
  sockets: Record<string, SocketSpec>;
  databases: Record<string, DatabaseSpec>;
} {
  const endpoints = new Set<string>([slug]);
  for (const spec of Object.values(attach)) endpoints.add(spec.slug);

  const sockets: Record<string, SocketSpec> = {};
  for (const endpoint of endpoints)
    sockets[endpoint] = endpointSocket(endpoint);

  const databases: Record<string, DatabaseSpec> = {};
  for (const [alias, spec] of Object.entries(attach)) {
    databases[alias] = { socket: spec.slug, catalog: spec.catalog };
  }

  return { sockets, databases };
}

// `duckdb` must have been built from pageSocketProps(slug, attach): without a `slug` socket `rpc` is
// never defined, and a different `attach` is advertised in context but never attached.
export function PageSocket({
  duckdb,
  slug,
  attach,
  children,
}: {
  duckdb: N6kDuckDB;
  slug: string;
  attach: Record<string, AttachSpec>;
  children: ReactNode;
}) {
  // `attach` is a fresh literal each render; its stable serialization is the dep key.
  const attachKey = JSON.stringify(attach);
  // Throws during render if the server did not grant `jsonrpc` (RegisteredWebsocket.rpc in @n6k.io/db).
  const rpc = useSocket(duckdb, slug)?.rpc;
  const value = useMemo(
    () => ({ rpc, slug, attach }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rpc, slug, attachKey],
  );

  return (
    <PageSocketContext.Provider value={value}>
      {children}
    </PageSocketContext.Provider>
  );
}
