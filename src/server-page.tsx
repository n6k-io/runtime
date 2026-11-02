import {
  createElement,
  useCallback,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import {
  PageStateContext,
  usePageState,
  type PageStateApi,
} from "./page-state";
import { usePageSocket } from "./page-socket";

/** Client runtime for a server-driven `page.py`: calls the page socket's JSON-RPC `render(state)` and
 *  renders the {component, props, children} tree the server returns. */

type Node = {
  component: string;
  props: Record<string, unknown>;
  children: (Node | string)[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isNode(v: unknown): v is Node {
  return (
    isRecord(v) &&
    typeof v.component === "string" &&
    isRecord(v.props) &&
    Array.isArray(v.children)
  );
}

function isElementType(v: unknown): v is ElementType {
  return typeof v === "function" || (isRecord(v) && "$$typeof" in v);
}

// Bridges a state-agnostic control to the page's bound key: reads the current
// value (falling back to the server's default until first interaction) and
// writes edits back up. Keeps the control itself ignorant of `usePageState`, so
// the same component renders in `.mdx` with a plain value/setValue pair.
function BoundControl({
  Comp,
  ...props
}: { Comp: ElementType } & Record<string, unknown>) {
  const { bind, value: serverValue, ...rest } = props;
  const [local, setLocal] = usePageState(String(bind));
  return <Comp value={local ?? serverValue} setValue={setLocal} {...rest} />;
}

// `components` is the vocabulary the server's tree names resolve against.
export function ServerPage({
  components,
}: {
  components: Record<string, unknown>;
}) {
  const { rpc } = usePageSocket();
  const [tree, setTree] = useState<Node>();
  const [, setState] = useState<Record<string, unknown>>({});
  const stateReference = useRef<Record<string, unknown>>({});
  const renderSeq = useRef(0);

  // Renders run concurrently server-side; only the latest request's tree is applied.
  const requestTree = useCallback(
    async (state: Record<string, unknown>) => {
      if (!rpc) return;
      const seq = ++renderSeq.current;
      try {
        const result = await rpc.call("render", { state });
        if (seq === renderSeq.current && isNode(result)) setTree(result);
      } catch (error) {
        if (seq === renderSeq.current) console.error("[n6k] render:", error);
      }
    },
    [rpc],
  );

  useEffect(() => {
    void requestTree(stateReference.current);
  }, [requestTree]);

  const api = useMemo<PageStateApi>(
    () => ({
      get: (key) => stateReference.current[key],
      set: (key, value) => {
        const next = { ...stateReference.current, [key]: value };
        stateReference.current = next;
        setState(next);
        void requestTree(next);
      },
    }),
    [requestTree],
  );

  // Resolve a component name against the vocabulary, walking one dot for
  // namespaced names: "Static.Metric" → components.Static.Metric (the
  // presentational twin). Mirrors how MDX resolves <Static.Metric>.
  function resolveComponent(name: string): ElementType | undefined {
    const [ns, member] = name.split(".");
    const top = components[ns];
    const found =
      member === undefined ? top : isRecord(top) ? top[member] : undefined;
    return isElementType(found) ? found : undefined;
  }

  function render(node: Node | string, key?: number): ReactNode {
    if (typeof node === "string") return node;
    const kids = node.children?.map((c, index) => render(c, index)) ?? [];
    if (node.component === "fragment")
      return <Fragment key={key}>{kids}</Fragment>;
    const Comp = resolveComponent(node.component);
    // Interactive controls (Python `g.Slider(key=…)`) serialize with a `bind`.
    // Controls are state-agnostic (value/setValue); the adapter reads/writes the
    // bound key so the same control also works in `.mdx` (which passes
    // value/setValue directly, no bind).
    if (Comp && "bind" in node.props)
      return <BoundControl key={key} Comp={Comp} {...node.props} />;
    return createElement(
      Comp ?? node.component,
      { key, ...node.props },
      ...kids,
    );
  }

  if (!tree) return <div>connecting…</div>;

  return (
    <PageStateContext.Provider value={api}>
      {render(tree)}
    </PageStateContext.Provider>
  );
}
