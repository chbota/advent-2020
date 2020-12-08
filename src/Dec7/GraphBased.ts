import * as fs from "fs";
import * as path from "path";

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

function node<T>(graph: Graph<T>, key: string): GraphNode<T> {
  if (!graph[key]) {
    throw new Error(`${key} missing from graph ${Object.keys(graph)}`);
  }

  return graph[key];
}

export function countNodes<T>(
  graph: Graph<T>,
  root: string,
  direction: "incoming" | "outgoing",
  countDuplicates: boolean,
  visited: { [key: string]: number } = {}
): number {
  if (visited[root] !== undefined) {
    return countDuplicates ? visited[root] : 0;
  }

  let nodeCount: number = 1;
  for (const edge of node(graph, root)[direction]) {
    if (visited[edge.key] === undefined) {
      nodeCount +=
        countNodes(graph, edge.key, direction, countDuplicates, visited) *
        edge.weight;
    } else if (countDuplicates) {
      nodeCount += visited[edge.key] * edge.weight;
    }
  }

  visited[root] = nodeCount;

  return nodeCount;
}

// Input loading

export function loadBagGraph(): Graph<string> {
  const pendingIncomingBagLinks: { [key: string]: string[] } = {};

  const graph = fs
    .readFileSync(path.join(__dirname, "input.txt"), "utf8")
    .split("\n")
    .reduce<Graph<string>>((accum, curr) => {
      const bagNameMatch = curr.match(/(.*) bags contain /);
      if (!bagNameMatch || bagNameMatch.length !== 2) {
        throw new Error(`Malformed bag rule: ${curr}`);
      }
      const bagName = bagNameMatch[1];

      const containedBagMatches = curr.matchAll(/(\d+?) (.+?) bags?(,|.)\s?/g);
      if (!containedBagMatches) {
        throw new Error(`Malformed bag rule: ${curr}`);
      }

      const outgoingEdges: Edge[] = [];
      for (const bagMatch of containedBagMatches) {
        // 0: full match
        // 1: bag count
        // 2: bag name
        // 3: separator (, or .)
        if (bagMatch.length !== 4) {
          throw new Error(`Malformed contained bag: ${bagMatch.toString()}`);
        }

        const containedBagName = bagMatch[2];

        outgoingEdges.push({
          key: containedBagName,
          weight: parseInt(bagMatch[1]),
        });

        // updating incoming nodes at contained node
        if (accum[containedBagName]) {
          accum[containedBagName].incoming.push({ key: bagName, weight: 1 });
        } else if (pendingIncomingBagLinks[containedBagName]) {
          pendingIncomingBagLinks[containedBagName].push(bagName);
        } else {
          pendingIncomingBagLinks[containedBagName] = [bagName];
        }
      }

      const bagNode: GraphNode<string> = {
        incoming: [],
        outgoing: outgoingEdges,
        val: bagName,
      };
      // process any pending incoming bag links
      if (pendingIncomingBagLinks[bagName]) {
        bagNode.incoming = pendingIncomingBagLinks[bagName].map((incoming) => ({
          key: incoming,
          weight: 1,
        }));

        delete pendingIncomingBagLinks[bagName];
      }

      accum[bagName] = bagNode;

      return accum;
    }, {});

  if (Object.keys(pendingIncomingBagLinks).length) {
    throw new Error(
      `Incomplete incoming bag links: ${Object.keys(pendingIncomingBagLinks)}`
    );
  }

  return graph;
}
