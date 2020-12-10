import * as fs from "fs";
import * as path from "path";
import { day } from "../Utils";

day(1, () => {
  console.log(findSumTo2020(loadData()));
  console.log(findSum(loadData(), 2020, 3));
});

export function findSumTo2020(nums: number[]): number {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      for (let k = 0; k < nums.length; k++) {
        if (i === j || j === k || i === k) {
          continue;
        }

        if (nums[i] + nums[j] + nums[k] === 2020) {
          return nums[i] * nums[j] * nums[k];
        }
      }
    }
  }

  return -1;
}

export function findSum(
  nums: number[],
  sumToFind: number,
  numToSum: number
): number {
  const candidateIndices: number[] = Array(numToSum).fill(0);

  // returns whether done
  const incrementIndices = () => {
    for (let i = candidateIndices.length - 1; i >= 0; i--) {
      if (candidateIndices[i] + 1 === nums.length) {
        // reset to 0, next iteration will increment the previous index
        candidateIndices[i] = 0;
        if (i === 0) {
          // if we're at the start and have checked the length of the array,
          // we're done
          return true;
        }
      } else {
        candidateIndices[i] = candidateIndices[i] + 1;
        return false;
      }
    }

    return false;
  };

  // we don't want to consider combos where we're looking at an index
  // more than once
  const shouldSkipCandidates = () => {
    for (let i = 0; i < candidateIndices.length; i++) {
      for (let j = 0; j < candidateIndices.length; j++) {
        if (i === j) {
          continue;
        }

        if (candidateIndices[i] === candidateIndices[j]) {
          return true;
        }
      }
    }

    return false;
  };

  const matchesDesiredSum = () => {
    return (
      candidateIndices.reduce((accum, current) => accum + nums[current], 0) ===
      sumToFind
    );
  };

  let done = false;

  while (!done) {
    if (!shouldSkipCandidates() && matchesDesiredSum()) {
      return candidateIndices.reduce(
        (accum, current) => accum * nums[current],
        1
      );
    }

    done = incrementIndices();
  }

  return -1;
}

export function loadData(): number[] {
  const input = fs.readFileSync(
    path.join(process.cwd(), "src/Dec1/input.txt"),
    { encoding: "utf-8" }
  );
  const splitInput = input.split("\n");
  return splitInput.map((val) => parseInt(val));
}
