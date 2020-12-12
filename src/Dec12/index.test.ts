import { rotateWaypoint } from ".";

describe("rotateWaypoint", () => {
  function rotateAndExpect({
    startX,
    startY,
    endX,
    endY,
    degrees,
  }: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    degrees: number;
  }) {
    const newPosition = rotateWaypoint(
      {
        waypointX: startX,
        waypointY: startY,
        boatX: 0,
        boatY: 0,
        direction: "E",
      },
      degrees
    );
    expect(newPosition.waypointX).toEqual(endX);
    expect(newPosition.waypointY).toEqual(endY);
  }

  it("rotates 90º right", () => {
    rotateAndExpect({ startX: 10, startY: 5, endX: -5, endY: 10, degrees: 90 });
    rotateAndExpect({
      startX: -10,
      startY: -5,
      endX: 5,
      endY: -10,
      degrees: 90,
    });
  });

  it("rotates 90º left", () => {
    rotateAndExpect({
      startX: 10,
      startY: 5,
      endX: 5,
      endY: -10,
      degrees: -90,
    });
    rotateAndExpect({
      startX: -10,
      startY: -5,
      endX: -5,
      endY: 10,
      degrees: -90,
    });
  });

  it("rotates 180º right", () => {
    rotateAndExpect({
      startX: 10,
      startY: 5,
      endX: -10,
      endY: -5,
      degrees: 180,
    });
    rotateAndExpect({
      startX: -10,
      startY: -5,
      endX: 10,
      endY: 5,
      degrees: 180,
    });
  });

  it("rotates 180º left", () => {
    rotateAndExpect({
      startX: 10,
      startY: 5,
      endX: -10,
      endY: -5,
      degrees: -180,
    });
    rotateAndExpect({
      startX: -10,
      startY: -5,
      endX: 10,
      endY: 5,
      degrees: -180,
    });
  });

  it("rotates 270º right", () => {
    rotateAndExpect({
      startX: 10,
      startY: 5,
      endX: 5,
      endY: -10,
      degrees: 270,
    });
    rotateAndExpect({
      startX: -10,
      startY: -5,
      endX: -5,
      endY: 10,
      degrees: 270,
    });
  });

  it("rotates 270º left", () => {
    rotateAndExpect({
      startX: 10,
      startY: 5,
      endX: -5,
      endY: 10,
      degrees: -270,
    });
    rotateAndExpect({
      startX: -10,
      startY: -5,
      endX: 5,
      endY: -10,
      degrees: -270,
    });
  });
});
