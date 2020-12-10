import * as fs from "fs";
import * as path from "path";

function checkAdapterCompatibility(
  outletJoltage: number,
  adapterJoltage: number
): { joltageDiff: number; isCompatible: boolean } {
  const joltageDiff = adapterJoltage - outletJoltage;
  return { joltageDiff, isCompatible: joltageDiff >= 0 && joltageDiff <= 3 };
}

export function tryUseAllAdapters(
  sortedAdapters: number[],
  startingJoltage: number,
  endingJoltage: number
): { joltages: number[]; joltageDiffs: Map<number, number> } {
  const result = {
    joltages: [startingJoltage],
    joltageDiffs: new Map<number, number>(),
  };

  for (let i = 0; i <= sortedAdapters.length; i++) {
    const nextJoltage =
      i === sortedAdapters.length ? endingJoltage : sortedAdapters[i];

    const compatibility = checkAdapterCompatibility(
      result.joltages[result.joltages.length - 1],
      nextJoltage
    );
    if (compatibility.isCompatible) {
      result.joltageDiffs.set(
        compatibility.joltageDiff,
        (result.joltageDiffs.get(compatibility.joltageDiff) ?? 0) + 1
      );
      result.joltages.push(nextJoltage);
    } else {
      throw new Error(`Couldn't use adapter ${nextJoltage}, ${i}`);
    }
  }

  return result;
}

export function countAllPaths(longestPath: number[]): number {
  const possibleNextAdapters: { [key: number]: number[] } = {};

  for (let i = 0; i < longestPath.length; i++) {
    const searchSlice = longestPath.slice(i + 1, i + 4);
    possibleNextAdapters[longestPath[i]] = searchSlice.filter(
      (val) => checkAdapterCompatibility(longestPath[i], val).isCompatible
    );
  }
  const pathsToNode: { [key: number]: number } = {};

  for (let i = 0; i < longestPath.length; i++) {
    const pathsToCurrentNode = pathsToNode[longestPath[i]] ?? 1;
    if (i === longestPath.length - 1) {
      return pathsToCurrentNode;
    }

    const possibleNextNodes = possibleNextAdapters[longestPath[i]];
    possibleNextNodes.forEach((next) => {
      pathsToNode[next] = (pathsToNode[next] ?? 0) + pathsToCurrentNode;
    });
  }

  return -1;
}

export function loadInput(): number[] {
  return fs
    .readFileSync(path.join(__dirname, "input.txt"), "utf8")
    .split(/\s/)
    .map((val) => parseInt(val))
    .sort((a, b) => a - b);
}
