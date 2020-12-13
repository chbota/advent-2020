import * as path from "path";
import * as fs from "fs";
import { day } from "../utils";

day(5, () => {
  const seatKeys = loadSeatRoutes()
    .map(findSeat.bind(undefined, 8, 128))
    .map(getSeatKey)
    .sort((a, b) => b - a);

  console.log(seatKeys[0]);

  // Find missing seat
  for (let i = 0; i < seatKeys.length; i++) {
    if (i === 0) {
      continue;
    }
    if (seatKeys[i] + 1 !== seatKeys[i - 1]) {
      console.log(
        `Found missing seat between: ${seatKeys[i]}, ${seatKeys[i - 1]}`
      );
    }
  }
});

export type Seat = { row: number; column: number };

type SearchLocation = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
};

function getMidpoint(start: number, end: number) {
  return start + Math.floor((end - start) / 2);
}

function updateSearchLocation(
  startingLocation: SearchLocation,
  routeEntry: string
): SearchLocation {
  const colMid = getMidpoint(
    startingLocation.colStart,
    startingLocation.colEnd
  );
  const rowMid = getMidpoint(
    startingLocation.rowStart,
    startingLocation.rowEnd
  );

  switch (routeEntry) {
    case "R":
      // take upper half of columns
      return {
        ...startingLocation,
        colStart: colMid + 1,
      };
    case "L":
      // take lower half of columns
      return {
        ...startingLocation,
        colEnd: colMid,
      };
    case "F":
      // take lower half of rows
      return {
        ...startingLocation,
        rowEnd: rowMid,
      };
    case "B":
      // take upper half of rows
      return {
        ...startingLocation,
        rowStart: rowMid + 1,
      };
  }

  throw new Error("Unexpected route entry");
}

export function findSeat(
  numColumns: number,
  numRows: number,
  seatRoute: string
): Seat {
  let currentSearchLocation: SearchLocation = {
    colStart: 0,
    colEnd: numColumns - 1,
    rowStart: 0,
    rowEnd: numRows - 1,
  };

  for (const entry of seatRoute) {
    currentSearchLocation = updateSearchLocation(currentSearchLocation, entry);
  }

  if (currentSearchLocation.colStart !== currentSearchLocation.colEnd) {
    throw new Error(
      `Didnt finish column search: ${currentSearchLocation.colStart}, ${currentSearchLocation.colEnd}`
    );
  }

  if (currentSearchLocation.rowStart !== currentSearchLocation.rowEnd) {
    throw new Error(
      `Didnt finish row search: ${currentSearchLocation.rowStart}, ${currentSearchLocation.rowEnd}`
    );
  }

  return {
    row: currentSearchLocation.rowStart,
    column: currentSearchLocation.colStart,
  };
}

export function getSeatKey(seat: Seat): number {
  return seat.column + 8 * seat.row;
}

export function loadSeatRoutes(): string[] {
  return fs.readFileSync(path.join(__dirname, "input.txt"), "utf8").split(/\s/);
}
