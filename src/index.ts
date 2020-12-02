import * as DecOne from './Dec1';
import * as DecTwo from './Dec2';

console.group('December 1');
console.log(DecOne.findSumTo2020(DecOne.loadData()));
console.log(DecOne.findSum(DecOne.loadData(), 2020, 3));
console.groupEnd();


console.group('December 2');
console.log(DecTwo.getNumValidPasswords(DecTwo.loadPasswordsAndPolicies(), DecTwo.letterCountPasswordValidator));
console.log(DecTwo.getNumValidPasswords(DecTwo.loadPasswordsAndPolicies(), DecTwo.oneLetterAtPositionsPasswordValidator));
console.groupEnd();