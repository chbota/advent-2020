import * as DecOne from "./Dec1";
import * as DecTwo from "./Dec2";
import * as DecThree from "./Dec3";
import * as DecFour from './Dec4';
import * as DecFive from './Dec5';

function consoleGroup(groupName: string, work: () => void) {
  console.group(groupName);
  work();
  console.groupEnd();
}

consoleGroup("December 1", () => {
  console.log(DecOne.findSumTo2020(DecOne.loadData()));
  console.log(DecOne.findSum(DecOne.loadData(), 2020, 3));
});

consoleGroup("December 2", () => {
  console.log(
    DecTwo.getNumValidPasswords(
      DecTwo.loadPasswordsAndPolicies(),
      DecTwo.letterCountPasswordValidator
    )
  );
  console.log(
    DecTwo.getNumValidPasswords(
      DecTwo.loadPasswordsAndPolicies(),
      DecTwo.oneLetterAtPositionsPasswordValidator
    )
  );
})

consoleGroup("December 3", () => {
  const testData = DecThree.loadData();

  console.log(DecThree.countTreesToEdge(testData, 1 /*rise*/, 3 /*run*/));

  const slopes = [
    [1, 1],
    [1, 3],
    [1, 5],
    [1, 7],
    [2, 1],
  ];

  const treeCounts = slopes.map((slope) => {
    return DecThree.countTreesToEdge(testData, slope[0], slope[1]);
  });

  const multipliedCounts = treeCounts.reduce((accum, curr) => accum * curr, 1);
  console.log(multipliedCounts);
})

consoleGroup("December 4", () => {
  console.log(DecFour.countValidPassports(DecFour.loadPassports(), DecFour.passportPolicy1));
  console.log(DecFour.countValidPassports(DecFour.loadPassports(), DecFour.passportPolicy2));
});

consoleGroup("December 5", () => {
  const seatKeys = DecFive.loadSeatRoutes()
    .map(DecFive.findSeat.bind(undefined, 8, 128))
    .map(DecFive.getSeatKey)
    .sort((a, b) => b - a);

  console.log(seatKeys[0]);

  // Find missing seat
  for (let i = 0; i < seatKeys.length; i++) {
    if (i === 0) {
      continue;
    }
    if (seatKeys[i] + 1 !== seatKeys[i - 1]) {
      console.log(`Found missing seat between: ${seatKeys[i]}, ${seatKeys[i - 1]}`)
    }
  }
})