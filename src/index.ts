import * as DecOne from "./Dec1";
import * as DecTwo from "./Dec2";
import * as DecThree from "./Dec3";
import * as DecFour from "./Dec4";
import * as DecFive from "./Dec5";
import * as DecSix from "./Dec6";
import * as DecSev from "./Dec7";
import * as DecSevGraph from "./Dec7/GraphBased";
import * as DecEight from "./Dec8";
import * as DecNine from "./Dec9";
import * as DecTen from "./Dec10";
import { findAllPaths } from "./Graph";

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;

function measurePerf<T>(
  groupName: string,
  work: () => T,
  iterations: number = 1
) {
  consoleGroup(groupName, () => {
    const runs: number[] = [];
    let result: T | undefined = undefined;

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime();
      result = work();
      const endDiff = process.hrtime(start);
      runs.push((endDiff[0] * NS_PER_SEC + endDiff[1]) / NS_PER_MS);
    }

    if (result !== undefined) {
      console.log(result);
    }
    console.log(
      `${iterations} runs, avg ${
        runs.reduce((accum, curr) => accum + curr, 0) / runs.length
      }ms`
    );
  });
}

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
});

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
});

consoleGroup("December 4", () => {
  console.log(
    DecFour.countValidPassports(
      DecFour.loadPassports(),
      DecFour.passportPolicy1
    )
  );
  console.log(
    DecFour.countValidPassports(
      DecFour.loadPassports(),
      DecFour.passportPolicy2
    )
  );
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
      console.log(
        `Found missing seat between: ${seatKeys[i]}, ${seatKeys[i - 1]}`
      );
    }
  }
});

consoleGroup("December 6", () => {
  const allAnswers = DecSix.loadAnswers();
  const questionsAnsweredByAnyone = allAnswers.map(
    DecSix.getQuestionsAnyoneAnswered
  );
  const questionsAnsweredByEveryone = allAnswers.map(
    DecSix.getQuestionsEveryoneAnswered
  );

  const sumAnswerCount = (answers: string[][]) =>
    answers.map((val) => val.length).reduce((accum, curr) => accum + curr, 0);

  console.log(sumAnswerCount(questionsAnsweredByAnyone));
  console.log(sumAnswerCount(questionsAnsweredByEveryone));
});

consoleGroup("December 7 - Tree Approach", () => {
  const bagRules = DecSev.loadBagRules();

  // measurePerf(
  //   "Problem 1",
  //   () => {
  //     return Object.keys(bagRules).filter((bag: string) => {
  //       return DecSev.reduceBagRuleTree(
  //         bagRules,
  //         false /* visitRoot */,
  //         DecSev.containsBag("shiny gold"),
  //         false,
  //         bag
  //       );
  //     }).length;
  //   },
  //   1
  // );

  measurePerf(
    "Problem 2",
    () =>
      DecSev.reduceBagRuleTree(
        bagRules,
        true /* visitRoot */,
        DecSev.countBags,
        0,
        "shiny gold"
      ),
    100
  );
});

consoleGroup("December 7 - Graph Approach", () => {
  const graph = DecSevGraph.loadBagGraph();
  measurePerf(
    "Problem 1",
    () => {
      return (
        DecSevGraph.countNodes(
          graph,
          "shiny gold",
          "incoming",
          false /*countDuplicates*/
        ) - 1
      ); // subtract 1 to not count "shiny gold"
    },
    100
  );

  measurePerf(
    "Problem 2",
    () =>
      DecSevGraph.countNodes(
        graph,
        "shiny gold",
        "outgoing",
        true /*countDuplicates*/
      ) - 1, // subtract 1 to not count "shiny gold"
    100
  );
});

consoleGroup("December 8", () => {
  const program = DecEight.loadProgram();

  measurePerf("Problem 1", () => {
    return DecEight.runUntilRepeat(program).accum;
  });

  measurePerf(
    "Problem 2",
    () => {
      const graph = DecEight.createInstructionGraph(program);

      const route = DecEight.findPath(graph, "0", "643");
      if (!route) {
        throw new Error("Failed to find path");
      }

      const swappedId = route.filter((entry) =>
        entry.includes("-swap")
      )[0] as string;

      const swappedIndex = parseInt(
        swappedId.substr(0, swappedId.indexOf("-"))
      );

      const modifiedProgram = {
        instructions: [...program.instructions],
      };
      modifiedProgram.instructions[swappedIndex] = {
        ...modifiedProgram.instructions[swappedIndex],
        type: program.instructions[swappedIndex].type === "jmp" ? "nop" : "jmp",
      };
      return DecEight.runUntilRepeat(modifiedProgram).accum;
    },
    10
  );
});

consoleGroup("December 9", () => {
  const data = DecNine.loadData();
  measurePerf("Problem 1", () => {
    try {
      DecNine.validateData(data);
    } catch (e) {
      return e;
    }
  });

  measurePerf("Problem 2", () => {
    const result: number[] = DecNine.findSumRange(data, 22406676)?.sort(
      (a, b) => a - b
    ) as number[];
    return result[0] + result[result.length - 1];
  });
});

consoleGroup("December 10", () => {
  const data = DecTen.loadInput();
  const start = 0;
  const end = data[data.length - 1] + 3;

  let longestPath: { joltages: number[]; joltageDiffs: Map<number, number> };
  measurePerf("Problem 1", () => {
    longestPath = DecTen.tryUseAllAdapters(data, start, end);
    return (
      (longestPath.joltageDiffs.get(1) || 0) *
      (longestPath.joltageDiffs.get(3) || 0)
    );
  });

  measurePerf("Problem 2", () => {
    return DecTen.countAllPaths(longestPath.joltages);
  });
});
