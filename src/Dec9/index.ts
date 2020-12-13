import * as fs from "fs";
import * as path from "path";
import { day, measurePerf } from "../utils";

day(9, () => {
  const data = loadData();
  measurePerf("Problem 1", () => {
    try {
      validateData(data);
    } catch (e) {
      return e;
    }
  });

  measurePerf("Problem 2", () => {
    const result: number[] = findSumRange(data, 22406676)?.sort(
      (a, b) => a - b
    ) as number[];
    return result[0] + result[result.length - 1];
  });
});

export function findSumRange(
  data: number[],
  val: number
): number[] | undefined {
  for (let i = 0; i < data.length; i++) {
    const firstVal = data[i];
    const range = [firstVal];
    let runningSum = firstVal;

    for (let j = i + 1; j < data.length && runningSum < val; j++) {
      range.push(data[j]);
      runningSum += data[j];
    }

    if (runningSum === val) {
      return range;
    }
  }

  return undefined;
}

export function validateData(data: number[]) {
  return data.every((val, idx) => {
    if (idx < 25) {
      return true;
    }

    const previous25 = data.slice(idx - 25, idx);

    const isValid = previous25.some((prevVal, idx) => {
      for (let i = 0; i < previous25.length; i++) {
        if (i === idx) {
          continue;
        }

        if (prevVal + previous25[i] === val) {
          return true;
        }
      }

      return false;
    });

    if (!isValid) {
      throw new Error(`Invalid entry: ${val}, ${idx}`);
    }
    return isValid;
  });
}

export function loadData(): number[] {
  return fs
    .readFileSync(path.join(__dirname, "input.txt"), "utf8")
    .split(/\s/)
    .map((val) => parseInt(val));
}
