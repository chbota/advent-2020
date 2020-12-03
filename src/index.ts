import * as DecOne from "./Dec1";
import * as DecTwo from "./Dec2";
import * as DecThree from "./Dec3";

console.group("December 1");
console.log(DecOne.findSumTo2020(DecOne.loadData()));
console.log(DecOne.findSum(DecOne.loadData(), 2020, 3));
console.groupEnd();

console.group("December 2");
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
console.groupEnd();

console.group("December 3");

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
console.groupEnd();
