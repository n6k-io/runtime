// The n6k extension's dial rule (duckdb-n6k-protocol connection_hub.cpp WsUrlFromBaseUrl):
// n6k(s)://host[:port][/prefix][?query] → ws(s)://host[:port][/prefix]/ws[?query].
export function wsUrl(url: string): string {
  if (/^wss?:\/\//.test(url)) return url;
  const m = /^(n6ks?):\/\/([^?]*)(\?.*)?$/.exec(url);
  if (!m)
    throw new Error(
      `${JSON.stringify(url)} is not a ws(s):// or n6k(s):// URL`,
    );
  const scheme = m[1] === "n6ks" ? "wss" : "ws";
  return `${scheme}://${m[2]!.replace(/\/+$/, "")}/ws${m[3] ?? ""}`;
}
