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

export function tryGetNode<T>(
  graph: Graph<T>,
  key: string
): GraphNode<T> | undefined {
  if (!graph[key]) {
    return undefined;
  }

  return graph[key];
}

export function getOrCreateNode<T>(graph: Graph<T>, idx: string) {
  const graphNode = graph[idx] ?? {
    incoming: [],
    outgoing: [],
    val: undefined,
  };

  graph[idx] = graphNode;
  return graphNode;
}

export function addEdge<T>(graph: Graph<T>, fromId: string, toId: string) {
  const from = getOrCreateNode(graph, fromId);
  const to = getOrCreateNode(graph, toId);
  from.outgoing.push({ key: toId, weight: 1 });
  to.incoming.push({ key: fromId, weight: 1 });
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

export function findAllPaths<T>(
  graph: Graph<T>,
  from: string,
  to: string,
  canVisit: (node: GraphNode<T>) => boolean
): string[][] {
  const allPathsFound = [];
  const nodesToProcess: {
    path: string[];
    key: string;
    visited: { [key: string]: boolean };
  }[] = [{ path: [], key: from, visited: {} }];

  while (nodesToProcess.length) {
    const current = nodesToProcess.pop();
    if (!current) {
      continue;
    }

    if (current.key === to) {
      allPathsFound.push([...current.path, current.key]);
      continue;
    }

    const currentNode = node(graph, current.key);
    const newPath = [...current.path, current.key];
    const newVisited = { ...current.visited, [current.key]: true };
    for (const edge of currentNode.outgoing) {
      if (!canVisit(node(graph, edge.key)) || current.visited[edge.key]) {
        continue;
      }

      nodesToProcess.push({
        key: edge.key,
        path: newPath,
        visited: newVisited,
      });
    }
  }

  return allPathsFound;
}
