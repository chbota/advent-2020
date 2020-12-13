import * as fs from "fs";
import * as path from "path";
import { day, measurePerf } from "../utils";

day(12, () => {
  const data = loadData();
  measurePerf("Problem 1", () => {
    const startingPosition: Position = {
      boatX: 0,
      boatY: 0,
      direction: "E",
      waypointX: 0,
      waypointY: 0,
    };
    let endingPosition = startingPosition;
    data.forEach(
      (action) => (endingPosition = runAction(action, endingPosition))
    );
    return Math.abs(endingPosition.boatX) + Math.abs(endingPosition.boatY);
  });

  measurePerf("Problem 2", () => {
    const startingPosition: Position = {
      boatX: 0,
      boatY: 0,
      direction: "E",
      waypointX: 10,
      waypointY: -1,
    };
    let endingPosition = startingPosition;
    data.forEach(
      (action) => (endingPosition = runActionWaypoint(action, endingPosition))
    );
    return Math.abs(endingPosition.boatX) + Math.abs(endingPosition.boatY);
  });
});

enum ActionType {
  MoveNorth = "N",
  MoveSouth = "S",
  MoveEast = "E",
  MoveWest = "W",
  TurnLeft = "L",
  TurnRight = "R",
  Forward = "F",
}

type Action = {
  type: ActionType;
  val: number;
};

const DIRECTIONS = ["W", "N", "E", "S"] as const;

type Position = {
  boatX: number;
  boatY: number;
  waypointX: number;
  waypointY: number;
  direction: typeof DIRECTIONS[number];
};

function runAction(action: Action, startingPosition: Position): Position {
  switch (action.type) {
    case ActionType.MoveNorth:
      return {
        ...startingPosition,
        boatY: startingPosition.boatY - action.val,
      };
    case ActionType.MoveSouth:
      return {
        ...startingPosition,
        boatY: startingPosition.boatY + action.val,
      };
    case ActionType.MoveEast:
      return {
        ...startingPosition,
        boatX: startingPosition.boatX + action.val,
      };
    case ActionType.MoveWest:
      return {
        ...startingPosition,
        boatX: startingPosition.boatX - action.val,
      };
    case ActionType.Forward:
      return runAction(
        {
          type: startingPosition.direction as ActionType,
          val: action.val,
        },
        startingPosition
      );
    case ActionType.TurnLeft: {
      const currentDirectionIdx = DIRECTIONS.indexOf(
        startingPosition.direction
      );
      const shiftLeftCount = action.val / 90;
      let newDirectionIdx = currentDirectionIdx - shiftLeftCount;
      if (newDirectionIdx < 0) {
        newDirectionIdx = DIRECTIONS.length + newDirectionIdx;
      }
      return {
        ...startingPosition,
        direction: DIRECTIONS[newDirectionIdx],
      };
    }
    case ActionType.TurnRight: {
      const currentDirectionIdx = DIRECTIONS.indexOf(
        startingPosition.direction
      );
      const shiftRightCount = action.val / 90;
      let newDirectionIdx = currentDirectionIdx + shiftRightCount;
      if (newDirectionIdx >= DIRECTIONS.length) {
        newDirectionIdx = newDirectionIdx - DIRECTIONS.length;
      }
      return {
        ...startingPosition,
        direction: DIRECTIONS[newDirectionIdx],
      };
    }
  }
}

function runActionWaypoint(
  action: Action,
  startingPosition: Position
): Position {
  switch (action.type) {
    case ActionType.MoveNorth:
      return {
        ...startingPosition,
        waypointY: startingPosition.waypointY - action.val,
      };
    case ActionType.MoveSouth:
      return {
        ...startingPosition,
        waypointY: startingPosition.waypointY + action.val,
      };
    case ActionType.MoveEast:
      return {
        ...startingPosition,
        waypointX: startingPosition.waypointX + action.val,
      };
    case ActionType.MoveWest:
      return {
        ...startingPosition,
        waypointX: startingPosition.waypointX - action.val,
      };
    case ActionType.Forward:
      return {
        ...startingPosition,
        boatX: startingPosition.boatX + startingPosition.waypointX * action.val,
        boatY: startingPosition.boatY + startingPosition.waypointY * action.val,
      };
    case ActionType.TurnLeft: {
      return rotateWaypoint(startingPosition, -action.val);
    }
    case ActionType.TurnRight: {
      return rotateWaypoint(startingPosition, action.val);
    }
  }
}

export function rotateWaypoint(
  startingPosition: Position,
  degrees: number
): Position {
  const shiftRight = degrees > 0;
  switch (Math.abs(degrees)) {
    case 90:
      return shiftRight
        ? {
            ...startingPosition,
            waypointX: -startingPosition.waypointY,
            waypointY: startingPosition.waypointX,
          }
        : {
            ...startingPosition,
            waypointX: startingPosition.waypointY,
            waypointY: -startingPosition.waypointX,
          };
    case 180:
      return {
        ...startingPosition,
        waypointX: -startingPosition.waypointX,
        waypointY: -startingPosition.waypointY,
      };
    case 270:
      return shiftRight
        ? {
            ...startingPosition,
            waypointX: startingPosition.waypointY,
            waypointY: -startingPosition.waypointX,
          }
        : {
            ...startingPosition,
            waypointX: -startingPosition.waypointY,
            waypointY: startingPosition.waypointX,
          };
    default:
      throw new Error(`Unexpected degree value ${degrees}`);
  }
}

function loadData(): Action[] {
  return fs
    .readFileSync(path.join(__dirname, "./input.txt"), "utf8")
    .split(/\s/)
    .map((entry) => {
      const type: ActionType = entry.substr(0, 1) as ActionType;
      const val = parseInt(entry.substr(1));
      return {
        type,
        val,
      };
    });
}
