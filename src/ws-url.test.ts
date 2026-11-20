import { describe, expect, it } from "bun:test";

import { wsUrl } from "./ws-url";

describe("wsUrl", () => {
  it("passes ws(s) URLs through", () => {
    expect(wsUrl("ws://h:1/x/ws?a=b")).toBe("ws://h:1/x/ws?a=b");
    expect(wsUrl("wss://h/ws")).toBe("wss://h/ws");
  });

  it("appends /ws after the prefix and before the query", () => {
    expect(wsUrl("n6k://h:53707")).toBe("ws://h:53707/ws");
    expect(wsUrl("n6k://h/pre?a=b")).toBe("ws://h/pre/ws?a=b");
    expect(wsUrl("n6ks://h:443/p/q")).toBe("wss://h:443/p/q/ws");
  });

  it("keeps userinfo", () => {
    expect(wsUrl("n6k://tok@h")).toBe("ws://tok@h/ws");
  });

  it("rejects other schemes", () => {
    expect(() => wsUrl("http://h")).toThrow();
    expect(() => wsUrl("h:1")).toThrow();
  });
});
