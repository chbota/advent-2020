import * as fs from "fs";
import * as path from "path";
import { day, measurePerf } from "../utils";

day(11, () => {
  let state = loadData();

  measurePerf("Problem 1", () => {
    function runTick(state: Cell[][]): Cell[][] {
      // make a deep copy
      const newState = state.map((val) => [...val]);

      for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[i].length; j++) {
          const cellType = state[i][j];
          if (cellType === Cell.Floor) {
            continue;
          }

          const adjacentOccupiedCount = getAdjacentCount(
            state,
            Cell.FullSeat,
            i,
            j
          );

          switch (cellType) {
            case Cell.EmptySeat:
              if (adjacentOccupiedCount === 0) {
                newState[i][j] = Cell.FullSeat;
              }
              break;
            case Cell.FullSeat:
              if (adjacentOccupiedCount >= 4) {
                newState[i][j] = Cell.EmptySeat;
              }
              break;
          }
        }
      }

      return newState;
    }

    let lastState = state;
    let currentState = runTick(state);

    while (!areEqual(currentState, lastState)) {
      lastState = currentState;
      currentState = runTick(currentState);
    }

    return getCount(currentState, Cell.FullSeat);
  });

  measurePerf("Problem 2", () => {
    function runTick(state: Cell[][]): Cell[][] {
      // make a deep copy
      const newState = state.map((val) => [...val]);

      for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[i].length; j++) {
          const cellType = state[i][j];
          if (cellType === Cell.Floor) {
            continue;
          }

          const adjacentOccupiedCount = getNearestAdjacentCount(
            state,
            Cell.FullSeat,
            i,
            j
          );

          switch (cellType) {
            case Cell.EmptySeat:
              if (adjacentOccupiedCount === 0) {
                newState[i][j] = Cell.FullSeat;
              }
              break;
            case Cell.FullSeat:
              if (adjacentOccupiedCount >= 5) {
                newState[i][j] = Cell.EmptySeat;
              }
              break;
          }
        }
      }

      return newState;
    }

    let lastState = state;
    let currentState = runTick(state);

    while (!areEqual(currentState, lastState)) {
      lastState = currentState;
      currentState = runTick(currentState);
    }

    return getCount(currentState, Cell.FullSeat);
  });
});

enum Cell {
  Floor = ".",
  EmptySeat = "L",
  FullSeat = "#",
}

function getAdjacentCount(
  state: Cell[][],
  cellType: Cell,
  y: number,
  x: number
): number {
  return [1, 0, -1].reduce((accY, offsetY) => {
    const neighborY = y + offsetY;
    if (neighborY === state.length || neighborY < 0) {
      return accY;
    }

    return (
      accY +
      [1, 0, -1].reduce((accX, offsetX) => {
        if (offsetX === 0 && offsetY === 0) {
          return accX;
        }

        const neighborX = x + offsetX;
        if (neighborX === state[neighborY].length || neighborX < 0) {
          return accX;
        }

        if (state[neighborY][neighborX] === cellType) {
          return accX + 1;
        }

        return accX;
      }, 0)
    );
  }, 0);
}

function getNearestAdjacentCount(
  state: Cell[][],
  cellType: Cell,
  y: number,
  x: number
): number {
  return [1, 0, -1].reduce((accY, offsetY) => {
    return (
      accY +
      [1, 0, -1].reduce((accX, offsetX) => {
        if (offsetX === 0 && offsetY === 0) {
          return accX;
        }

        let multiplier = 1;
        let nearestAdjacent: Cell = Cell.Floor;
        while (nearestAdjacent === Cell.Floor) {
          const neighborY = y + offsetY * multiplier;
          if (neighborY === state.length || neighborY < 0) {
            break;
          }

          const neighborX = x + offsetX * multiplier;
          if (neighborX === state[neighborY].length || neighborX < 0) {
            break;
          }

          nearestAdjacent = state[neighborY][neighborX];
          multiplier++;
        }

        if (nearestAdjacent === cellType) {
          return accX + 1;
        }

        return accX;
      }, 0)
    );
  }, 0);
}

function areEqual(a: Cell[][], b: Cell[][]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((aRow, aRowIndex) => {
    const bRow = b[aRowIndex];
    if (bRow.length !== aRow.length) {
      return false;
    }

    return aRow.every((aVal, aValIndex) => bRow[aValIndex] === aVal);
  });
}

function getCount(state: Cell[][], cellType: Cell): number {
  return state.reduce((acc, row) => {
    return (
      acc +
      row.reduce((accVal, val) => {
        return accVal + (val === cellType ? 1 : 0);
      }, 0)
    );
  }, 0);
}

function loadData(): Cell[][] {
  return fs
    .readFileSync(path.join(__dirname, "input.txt"), "utf8")
    .split(/\s/)
    .map((row) => Array.from(row).map((cell) => cell as Cell));
}
