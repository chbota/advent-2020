import { day, measurePerf } from "../utils";

day(15, () => {
  const input = [1, 12, 0, 20, 8, 16];

  measurePerf("Problem 1", () => {
    return runToTurn(input, 2020);
  });

  measurePerf("Problem 2", () => {
    return runToTurn(input, 30000000);
  });
});

function runToTurn(input: number[], turn: number): number {
  const numberTurnAnnouncedMap: { [key: number]: number[] } = {};
  const announcementsHistory: number[] = [];

  const announce = (num: number) => {
    const turnCount = announcementsHistory.length + 1;
    if (numberTurnAnnouncedMap[num]) {
      numberTurnAnnouncedMap[num].push(turnCount);
    } else {
      numberTurnAnnouncedMap[num] = [turnCount];
    }

    announcementsHistory.push(num);
  };

  input.forEach(announce);

  while (announcementsHistory.length <= turn) {
    const lastAnnounced = announcementsHistory[announcementsHistory.length - 1];
    const turnsAnnounced = numberTurnAnnouncedMap[lastAnnounced];
    if (turnsAnnounced.length === 1) {
      announce(0);
    } else {
      announce(
        turnsAnnounced[turnsAnnounced.length - 1] -
          turnsAnnounced[turnsAnnounced.length - 2]
      );
    }
  }

  return announcementsHistory[turn - 1];
}
