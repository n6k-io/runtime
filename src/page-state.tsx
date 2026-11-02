import { createContext, useContext } from "react";

/** State bridge for a server-driven page; controls read/write bound keys to push state up. */
export type PageStateApi = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
};

export const PageStateContext = createContext<PageStateApi | undefined>(
  undefined,
);

/** Read/write one bound key of the page's UI state, à la useState. */
export function usePageState(key: string): [unknown, (value: unknown) => void] {
  const api = useContext(PageStateContext);
  if (!api) {
    throw new Error(
      "usePageState must be used inside a <ServerPage> (PageStateContext missing)",
    );
  }
  return [api.get(key), (value) => api.set(key, value)];
}
