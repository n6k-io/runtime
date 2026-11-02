import type { ReactNode } from "react";
import { AlertDialog } from "radix-ui";
import { useDuckDB } from "@n6k.io/ui/duckdb";

type DuckDBConnectionGuardProps = {
  children: ReactNode;
};

export function DuckDBConnectionGuard({
  children,
}: DuckDBConnectionGuardProps) {
  const { status, error } = useDuckDB();
  const open = status === "error";

  return (
    <>
      {children}
      <AlertDialog.Root open={open}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-background p-6 ring-1 ring-foreground/10">
            <AlertDialog.Title className="text-base font-medium text-destructive">
              Connection Failed
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 min-h-0 flex-1 overflow-auto rounded-md bg-muted/40 p-3 text-left font-mono text-xs whitespace-pre-wrap text-muted-foreground">
              {error}
            </AlertDialog.Description>
            <button
              className="mt-4 self-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
