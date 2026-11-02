/// <reference path="./virtual-modules.d.ts" />
import { useState, type ReactNode } from "react";
import { duckdbWorkerUrl, wsWorkerUrl } from "virtual:n6k-workers";
import { duckdbBundle } from "virtual:n6k-duckdb-bundle";
import { N6kDuckDB } from "@n6k.io/db";
import { DuckDBProvider, QueryProvider } from "@n6k.io/ui/duckdb";

import type { AttachSpec } from "./attach-spec";
import { ConnectionLost } from "./connection-lost";
import { DuckDBConnectionGuard } from "./duckdb-connection-guard";
import { PageSocket, pageSocketProps } from "./page-socket";

export function Root({
  children,
  attach = {},
  slug = "index",
}: {
  children: ReactNode;
  attach?: Record<string, AttachSpec>;
  slug?: string;
}) {
  // One engine per mount. Trap: later `slug`/`attach` changes reach PageSocket's context but not the
  // engine, so the context advertises catalogs that were never attached and a new `slug` never gets an `rpc`.
  const [duckdb] = useState(
    () =>
      new N6kDuckDB({
        bundle: duckdbBundle,
        duckdbWorkerUrl,
        wsWorkerUrl,
        ...pageSocketProps(slug, attach),
      }),
  );
  return (
    <QueryProvider>
      <DuckDBProvider connect={duckdb.connect} metadataFns={duckdb.metadataFns}>
        <PageSocket duckdb={duckdb} slug={slug} attach={attach}>
          <DuckDBConnectionGuard>{children}</DuckDBConnectionGuard>
          <ConnectionLost duckdb={duckdb} />
        </PageSocket>
      </DuckDBProvider>
    </QueryProvider>
  );
}
