const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;

export function measurePerf<T>(
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

export function consoleGroup(groupName: string, work: () => void) {
  console.group(groupName);
  work();
  console.groupEnd();
}

const REGISTERED_DAYS: { [key: number]: () => void } = {};

export function getRegisteredDays(): { [key: number]: () => void } {
  return { ...REGISTERED_DAYS };
}

export function day(dayNumber: number, work: () => void) {
  REGISTERED_DAYS[dayNumber] = () => {
    consoleGroup(`Day ${dayNumber}`, work);
  };
}
