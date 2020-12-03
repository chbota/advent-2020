import * as fs from "fs";
import * as path from "path";

export enum MapNode {
  Tree,
  Land,
}

export function loadData(): MapNode[][] {
  const input = fs
    .readFileSync(path.join(__dirname, "input.txt"), {
      encoding: "utf-8",
    })
    .split("\n");

  return input.map((line) => {
    const lineContent: MapNode[] = [];
    for (const char of line) {
      if (char === "#") {
        lineContent.push(MapNode.Tree);
      } else {
        lineContent.push(MapNode.Land);
      }
    }
    return lineContent;
  });
}

export function countTreesToEdge(
  land: MapNode[][],
  rise: number,
  run: number
): number {
  let currentLocation = [0, 0];
  let countOfTrees = 0;

  const isOnTree = () => {
    let adjustedX = currentLocation[0];
    if (currentLocation[0] >= land[0].length) {
      adjustedX = adjustedX % land[0].length;
    }

    return land[currentLocation[1]][adjustedX] === MapNode.Tree;
  };

  const doMove = () => {
    currentLocation = [currentLocation[0] + run, currentLocation[1] + rise];
  };

  // repeat until we're at the bottom edge
  while (currentLocation[1] !== land.length - 1) {
    doMove();
    if (isOnTree()) {
      countOfTrees++;
    }
  }

  return countOfTrees;
}
