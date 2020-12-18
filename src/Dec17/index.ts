import * as fs from "fs";
import * as path from "path";
import { day, measurePerf } from "../utils";

day(17, () => {
  const initial = loadData();
  measurePerf("Problem 1", () => {
    let current = initial;

    for (let i = 0; i < 6; i++) {
      current = runStep(current);
    }

    let count = 0;
    for (const xRow of Object.values(current)) {
      for (const yCol of Object.values(xRow)) {
        for (const zCell of Object.values(yCol)) {
          if (zCell) {
            count++;
          }
        }
      }
    }

    return count;
  });
});

function forEachNeighbor(
  cubes: Cubes,
  x: number,
  y: number,
  z: number,
  work: (nX: number, nY: number, nZ: number, active: boolean) => void
) {
  for (const xDelta of [1, 0, -1]) {
    for (const yDelta of [1, 0, -1]) {
      for (const zDelta of [1, 0, -1]) {
        if (xDelta === yDelta && yDelta === zDelta && zDelta === 0) {
          continue;
        }

        const xCand = x + xDelta;
        const yCand = y + yDelta;
        const zCand = z + zDelta;

        work(xCand, yCand, zCand, isActive(cubes, xCand, yCand, zCand));
      }
    }
  }
}

function setActive(
  cubes: Cubes,
  active: boolean,
  x: number,
  y: number,
  z: number
) {
  if (!cubes[x]) {
    cubes[x] = {};
  }

  if (!cubes[x][y]) {
    cubes[x][y] = {};
  }

  if (!active) {
    cubes[x][y][z] = false;
  } else {
    cubes[x][y][z] = true;
    // realize the neighors
    forEachNeighbor(cubes, x, y, z, (nX, nY, nZ, active) => {
      if (!active) {
        setActive(cubes, active, nX, nY, nZ);
      }
    });
  }
}

function isActive(cubes: Cubes, x: number, y: number, z: number): boolean {
  return cubes[x] && cubes[x][y] && cubes[x][y][z];
}

function getActiveNeighbors(
  cubes: Cubes,
  x: number,
  y: number,
  z: number
): number[][] {
  const result: number[][] = [];

  forEachNeighbor(cubes, x, y, z, (nX, nY, nZ) => {
    if (isActive(cubes, nX, nY, nZ)) {
      result.push([nX, nY, nZ]);
    }
  });

  return result;
}

function runStep(cubes: Cubes): Cubes {
  const result: Cubes = JSON.parse(JSON.stringify(cubes));

  for (const xIdxStr in cubes) {
    const xIdx = parseInt(xIdxStr);
    for (const yIdxStr in cubes[xIdx]) {
      const yIdx = parseInt(yIdxStr);
      for (const zIdxStr in cubes[xIdx][yIdx]) {
        const zIdx = parseInt(zIdxStr);

        const activeNeighbors = getActiveNeighbors(cubes, xIdx, yIdx, zIdx);

        if (cubes[xIdx][yIdx][zIdx]) {
          setActive(
            result,
            activeNeighbors.length === 2 || activeNeighbors.length === 3,
            xIdx,
            yIdx,
            zIdx
          );
        } else {
          setActive(result, activeNeighbors.length === 3, xIdx, yIdx, zIdx);
        }
      }
    }
  }

  return result;
}

type Cubes = { [x: number]: { [y: number]: { [z: number]: boolean } } };

function loadData(): Cubes {
  return fs
    .readFileSync(path.join(__dirname, "input.txt"), "utf8")
    .split(/\n/)
    .reduce((acc, curr, yIdx) => {
      const cubes = Array.from(curr);

      cubes.forEach((cube, xIdx) => {
        if (cube === "#") {
          setActive(acc, true, xIdx, yIdx, 0);
        }
      });

      return acc;
    }, {} as Cubes);
}
