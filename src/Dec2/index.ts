import * as fs from "fs";
import * as path from "path";
import { day } from "../utils";

day(2, () => {
  console.log(
    getNumValidPasswords(
      loadPasswordsAndPolicies(),
      letterCountPasswordValidator
    )
  );
  console.log(
    getNumValidPasswords(
      loadPasswordsAndPolicies(),
      oneLetterAtPositionsPasswordValidator
    )
  );
});

interface PasswordPolicy {
  letter: string;
  firstNum: number;
  secondNum: number;
}

interface PasswordAndPolicy {
  policy: PasswordPolicy;
  password: string;
}

function getCountofLetter(
  letter: string,
  password: string,
  startIndex: number,
  endIndexExclusive: number
): number {
  let numLetterFound = 0;
  for (let i = startIndex; i < endIndexExclusive; i++) {
    if (password.charAt(i) === letter) {
      numLetterFound++;
    }
  }

  return numLetterFound;
}

export function letterCountPasswordValidator(
  passAndPolicy: PasswordAndPolicy
): boolean {
  // requires count of letter to be between firstNum and secondNum, inclusive
  const numLetterFound = getCountofLetter(
    passAndPolicy.policy.letter,
    passAndPolicy.password,
    0,
    passAndPolicy.password.length
  );
  return (
    numLetterFound >= passAndPolicy.policy.firstNum &&
    numLetterFound <= passAndPolicy.policy.secondNum
  );
}

export function oneLetterInRangePasswordValidator(
  passAndPolicy: PasswordAndPolicy
): boolean {
  // for this problem, firstNum + secondNum are 1-based indices for a range where we expect 1 occurrence of letter
  const numLetterFound = getCountofLetter(
    passAndPolicy.policy.letter,
    passAndPolicy.password,
    passAndPolicy.policy.firstNum - 1,
    passAndPolicy.policy.secondNum
  );
  return numLetterFound === 1;
}

export function oneLetterAtPositionsPasswordValidator(
  passAndPolicy: PasswordAndPolicy
): boolean {
  // for this problem, firstNum + secondNum are 1-based indices for a range where we expect 1 occurrence of letter
  const positionOneLetter = passAndPolicy.password.charAt(
    passAndPolicy.policy.firstNum - 1
  );
  const positionTwoLetter = passAndPolicy.password.charAt(
    passAndPolicy.policy.secondNum - 1
  );
  return (
    (positionOneLetter === passAndPolicy.policy.letter ||
      positionTwoLetter === passAndPolicy.policy.letter) &&
    positionOneLetter !== positionTwoLetter
  );
}

export function getNumValidPasswords(
  input: PasswordAndPolicy[],
  passwordValidator: (passAndPolicy: PasswordAndPolicy) => boolean
) {
  return input.reduce((accum, curr) => {
    if (passwordValidator(curr)) {
      return accum + 1;
    }

    return accum;
  }, 0);
}

export function loadPasswordsAndPolicies(): PasswordAndPolicy[] {
  const input = fs.readFileSync(
    path.join(process.cwd(), "src/Dec2/input.txt"),
    { encoding: "utf-8" }
  );
  const splitInput = input.split("\n");

  const result: PasswordAndPolicy[] = [];

  // each password + policy pair is formatted as:
  // firstNum-secondNum letter: password
  splitInput.forEach((curr) => {
    // split on spaces
    const splitEntry = curr.split(" ");
    if (splitEntry.length !== 3) {
      if (splitEntry.length === 1 && splitEntry[0] === "") {
        // empty whitespace line, skip
        return;
      }
      throw new Error("Invalid password + policy pair");
    }

    const numSeparator = splitEntry[0].indexOf("-");
    if (numSeparator < 0) {
      throw new Error("Malformed password policy");
    }

    const policy = {
      letter: splitEntry[1].substr(0, splitEntry[1].length - 1), // remove :
      firstNum: parseInt(splitEntry[0].substr(0, numSeparator)),
      secondNum: parseInt(splitEntry[0].substr(numSeparator + 1)),
    };

    result.push({
      policy,
      password: splitEntry[2],
    });
  });

  return result;
}
