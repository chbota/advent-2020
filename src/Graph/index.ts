export type Edge = {
  key: string;
  weight: number;
};

export type GraphNode<T> = {
  incoming: Edge[];
  outgoing: Edge[];
  val: T;
};

export type Graph<T> = { [key: string]: GraphNode<T> };

export function node<T>(graph: Graph<T>, key: string): GraphNode<T> {
  if (!graph[key]) {
    throw new Error(`${key} missing from graph ${Object.keys(graph)}`);
  }

  return graph[key];
}

export function printNodes<T>(
  graph: Graph<T>,
  root: string,
  direction: "incoming" | "outgoing"
): void {
  console.group(root);
  for (const edge of node(graph, root)[direction]) {
    printNodes(graph, edge.key, direction);
  }
  console.log(`END: ${root}`);
  console.groupEnd();
}
