import * as fs from "fs";
import * as path from "path";
import { addEdge, getOrCreateNode, Graph, GraphNode, node } from "../Graph";

export const VALID_INSTRUCTIONS = ["jmp", "acc", "nop"] as const;
export type Instruction = {
  type: typeof VALID_INSTRUCTIONS[number];
  arg: number;
};

export type Program = {
  instructions: Instruction[];
};

export type RuntimeState = {
  accum: number;
  instructionPtr: number;
};

export function findPath(
  graph: Graph<Instruction>,
  from: string,
  to: string,
  visited: { [key: string]: boolean } = {},
  seenSwap: boolean = false
): string[] | undefined {
  if (visited[from]) {
    return undefined;
  }

  const fromNode = node(graph, from);
  if (from === to) {
    return [from];
  }

  for (const edge of fromNode.outgoing) {
    if (edge.key.includes("-swap") && seenSwap) {
      continue;
    }
    const newVisited: { [key: string]: boolean } = { ...visited, [from]: true };
    const path = findPath(
      graph,
      edge.key,
      to,
      newVisited,
      edge.key.includes("-swap") || seenSwap
    );
    if (path) {
      return [from, ...path];
    }
  }

  return undefined;
}

export function createInstructionGraph(program: Program): Graph<Instruction> {
  const instructionGraph: Graph<Instruction> = {};

  program.instructions.forEach((curr, idx) => {
    const graphNode = getOrCreateNode(instructionGraph, String(idx));
    graphNode.val = { ...curr };

    const outgoingIndex =
      graphNode.val.type === "jmp" ? idx + graphNode.val.arg : idx + 1;

    addEdge(instructionGraph, String(idx), String(outgoingIndex));
  });

  // Add swapped nodes
  // This could probably be done in a single iteration but this will be good enough
  Object.entries(instructionGraph).forEach((entry) => {
    if (entry[1].val === undefined || entry[1].val.type === "acc") {
      return;
    }

    const swappedNodeId = entry[0] + "-swap";

    const swappedNode = getOrCreateNode(instructionGraph, swappedNodeId);
    swappedNode.val = entry[1].val;
    swappedNode.val.type = swappedNode.val.type === "jmp" ? "nop" : "jmp";

    entry[1].incoming.forEach((edge) =>
      addEdge(instructionGraph, edge.key, swappedNodeId)
    );

    const swappedNodeOutgoingIndex =
      swappedNode.val.type === "nop"
        ? parseInt(entry[0]) + 1
        : parseInt(entry[0]) + swappedNode.val.arg;

    addEdge(instructionGraph, swappedNodeId, String(swappedNodeOutgoingIndex));
  });

  return instructionGraph;
}

export function runUntilRepeat(
  program: Program,
  runtime: RuntimeState = { accum: 0, instructionPtr: 0 }
): RuntimeState {
  const seenInstructions: { [key: number]: boolean } = {};

  while (!seenInstructions[runtime.instructionPtr]) {
    seenInstructions[runtime.instructionPtr] = true;
    runtime = runStep(program, runtime);
  }

  return runtime;
}

export function runStep(
  program: Program,
  runtime: RuntimeState = { accum: 0, instructionPtr: 0 },
  backwards: boolean = false
): RuntimeState {
  if (
    (!backwards && runtime.instructionPtr >= program.instructions.length) ||
    (backwards && runtime.instructionPtr <= 0)
  ) {
    return runtime; // program done
  }

  const instruction = program.instructions[runtime.instructionPtr];

  const nextState = { ...runtime };
  let ptrDelta = 1;
  switch (instruction.type) {
    case "acc":
      nextState.accum += instruction.arg;
      break;
    case "jmp":
      ptrDelta = instruction.arg;
      break;
    case "nop":
      break;
  }

  if (backwards) {
    ptrDelta = -ptrDelta;
  }
  nextState.instructionPtr += ptrDelta;

  return nextState;
}

export function loadProgram(): Program {
  return {
    instructions: fs
      .readFileSync(path.join(__dirname, "input.txt"), "utf8")
      .split(/\n/)
      .map((entry) => {
        const match = entry.match(/(.{3}) (\+|-)(\d+)$/);
        if (!match || match.length !== 4) {
          throw new Error(`Malformed entry: ${entry}`);
        }

        if (
          !VALID_INSTRUCTIONS.includes(
            match[1] as typeof VALID_INSTRUCTIONS[number]
          )
        ) {
          throw new Error(`Unknown instruction: ${match[1]}`);
        }

        return {
          type: match[1],
          arg: match[2] === "-" ? -parseInt(match[3]) : parseInt(match[3]),
        } as Instruction;
      }),
  };
}
