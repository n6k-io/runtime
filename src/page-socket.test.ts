import { afterEach, describe, expect, it } from "bun:test";

import { pageSocketProps } from "./page-socket";

const realLocation = globalThis.location;
const realWebSocket = globalThis.WebSocket;

function stubBrowser(protocol: string, host: string): string[] {
  const opened: string[] = [];
  Object.defineProperty(globalThis, "location", {
    value: { protocol, host },
    configurable: true,
  });
  globalThis.WebSocket = class {
    constructor(url: string) {
      opened.push(url);
    }
  } as unknown as typeof WebSocket;
  return opened;
}

afterEach(() => {
  Object.defineProperty(globalThis, "location", {
    value: realLocation,
    configurable: true,
  });
  globalThis.WebSocket = realWebSocket;
});

describe("pageSocketProps", () => {
  it("opens only the page's own socket when nothing is attached", () => {
    const { sockets, databases } = pageSocketProps("index", {});
    expect(Object.keys(sockets)).toEqual(["index"]);
    expect(databases).toEqual({});
  });

  it("dedupes endpoints and routes each alias over its endpoint's socket", () => {
    const { sockets, databases } = pageSocketProps("a/b", {
      own: { slug: "a/b", catalog: "x" },
      db: { slug: "index", catalog: "db" },
      db2: { slug: "index", catalog: "other" },
    });
    expect(Object.keys(sockets).toSorted()).toEqual(["a/b", "index"]);
    expect(databases).toEqual({
      own: { socket: "a/b", catalog: "x" },
      db: { socket: "index", catalog: "db" },
      db2: { socket: "index", catalog: "other" },
    });
  });

  it("connects to /<endpoint>/ws with ws or wss by page protocol", () => {
    const { sockets } = pageSocketProps("p", {
      db: { slug: "index", catalog: "db" },
    });
    const connect = (name: string) => {
      const spec = sockets[name]!;
      if (!("connect" in spec)) throw new Error("expected connect spec");
      spec.connect();
    };

    const http = stubBrowser("http:", "demo.localhost:7823");
    connect("p");
    connect("index");
    expect(http).toEqual([
      "ws://demo.localhost:7823/p/ws",
      "ws://demo.localhost:7823/index/ws",
    ]);

    const https = stubBrowser("https:", "example.com");
    connect("index");
    expect(https).toEqual(["wss://example.com/index/ws"]);
  });
});
