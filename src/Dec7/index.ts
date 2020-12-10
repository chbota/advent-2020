import * as fs from "fs";
import * as path from "path";
import { day, measurePerf } from "../Utils";
import { countNodes, loadBagGraph } from "./GraphBased";

day(7.1, () => {
  const bagRules = loadBagRules();

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
      reduceBagRuleTree(
        bagRules,
        true /* visitRoot */,
        countBags,
        0,
        "shiny gold"
      ),
    100
  );
});

day(7.2, () => {
  const graph = loadBagGraph();
  measurePerf(
    "Problem 1",
    () => {
      return (
        countNodes(graph, "shiny gold", "incoming", false /*countDuplicates*/) -
        1
      ); // subtract 1 to not count "shiny gold"
    },
    100
  );

  measurePerf(
    "Problem 2",
    () =>
      countNodes(graph, "shiny gold", "outgoing", true /*countDuplicates*/) - 1, // subtract 1 to not count "shiny gold"
    100
  );
});

export type BagRule = {
  bagName: string;
  contains: string[];
};

export type BagRuleMap = { [key: string]: BagRule };

function throwMissingBag(bagRuleMap: BagRuleMap, bag: string) {
  throw new Error(`${bag} missing from BagRuleMap ${Object.keys(bagRuleMap)}`);
}

export type BagRuleReducer<T> = (
  accum: T,
  curr: BagRule,
  done: () => void
) => T;

export function reduceBagRuleTree<T>(
  bagRuleMap: BagRuleMap,
  visitRoot: boolean,
  predicate: BagRuleReducer<T>,
  initial: T,
  rootBag: string
): T {
  if (!bagRuleMap[rootBag]) {
    throwMissingBag(bagRuleMap, rootBag);
  }

  const bagRulesToVisit: BagRule[] = [];

  const visitChildNodes = (bag: string) => {
    bagRulesToVisit.push(
      ...bagRuleMap[bag].contains.map((containedBag) => {
        if (!bagRuleMap[containedBag]) {
          throwMissingBag(bagRuleMap, containedBag);
        }
        return bagRuleMap[containedBag];
      })
    );
  };

  let currentVal: T = initial;
  let done: boolean = false;
  const doneCallback = () => (done = true);

  if (visitRoot) {
    bagRulesToVisit.push(bagRuleMap[rootBag]);
  } else {
    visitChildNodes(rootBag);
  }

  while (bagRulesToVisit.length && !done) {
    const candidate = bagRulesToVisit.pop();
    if (!candidate) {
      throw new Error("not reached");
    }
    currentVal = predicate(currentVal, candidate, doneCallback);
    if (!done) {
      visitChildNodes(candidate.bagName);
    }
  }

  return currentVal;
}

export function containsBag(targetBag: string): BagRuleReducer<boolean> {
  return (_: boolean, current: BagRule, done: () => void): boolean => {
    if (current.bagName === targetBag) {
      done();
      return true;
    }

    return false;
  };
}

export const countBags: BagRuleReducer<number> = (
  accum: number,
  current: BagRule,
  _done: () => void
): number => {
  return accum + current.contains.length;
};

// Input loading

export function loadBagRules(): BagRuleMap {
  return fs
    .readFileSync(path.join(__dirname, "input.txt"), "utf8")
    .split("\n")
    .reduce<BagRuleMap>((accum, curr) => {
      const bagNameMatch = curr.match(/(.*) bags contain /);
      if (!bagNameMatch || bagNameMatch.length !== 2) {
        throw new Error(`Malformed bag rule: ${curr}`);
      }
      const bagName = bagNameMatch[1];

      const containedBagMatches = curr.matchAll(/(\d+?) (.+?) bags?(,|.)\s?/g);
      if (!containedBagMatches) {
        throw new Error(`Malformed bag rule: ${curr}`);
      }

      const containedBags = [];
      for (const bagMatch of containedBagMatches) {
        // 0: full match
        // 1: bag count
        // 2: bag name
        // 3: separator (, or .)
        if (bagMatch.length !== 4) {
          throw new Error(`Malformed contained bag: ${bagMatch.toString()}`);
        }

        containedBags.push(...Array(parseInt(bagMatch[1])).fill(bagMatch[2]));
      }

      accum[bagName] = { bagName, contains: containedBags };

      return accum;
    }, {});
}
