import * as fs from "fs";
import * as path from "path";
import { day, measurePerf } from "../utils";

day(16, () => {
  const input = loadInput();
  measurePerf("Problem 1", () => {
    const validations = input.nearbyTickets.map((ticket) =>
      isValid(input.fields, ticket)
    );

    return validations.reduce((acc, curr) => {
      if (curr.isValid) {
        return acc;
      }

      return curr.invalidValues.reduce((accSum, currSum) => {
        return accSum + currSum;
      }, acc);
    }, 0);
  });

  measurePerf("Problem 2", () => {
    const filteredInput = {
      fields: input.fields,
      yourTicket: input.yourTicket,
      nearbyTickets: input.nearbyTickets.filter(
        (ticket) => isValid(input.fields, ticket).isValid
      ),
    };

    const fieldCandidates: Set<Field>[] = filteredInput.nearbyTickets.reduce(
      (acc, curr) => {
        curr.forEach((value, idx) => {
          const existingCandidates = acc[idx];

          if (existingCandidates.size === 0) {
            filteredInput.fields.forEach((field) => {
              if (isValidForField(field, value)) {
                existingCandidates.add(field);
              }
            });
          } else {
            for (const candidate of existingCandidates.values()) {
              if (!isValidForField(candidate, value)) {
                existingCandidates.delete(candidate);
              }
            }
          }
        });

        return acc;
      },
      Array(filteredInput.fields.length)
        .fill(0)
        .map(() => new Set<Field>())
    );

    const fieldAssignments: { [name: string]: number[] } = {};
    for (const [idx, candidates] of fieldCandidates.entries()) {
      for (const candidate of candidates) {
        const existingAssignments = fieldAssignments[candidate.name];

        if (!existingAssignments) {
          fieldAssignments[candidate.name] = [idx];
          continue;
        }

        // there's another valid option that exists so
        // use that instead of contending for this
        if (candidates.size > 1) {
          continue;
        }

        // there's only one valid option here so claim it
        fieldAssignments[candidate.name] = [idx];
      }
    }

    console.log(fieldAssignments);
    return Object.entries(fieldAssignments).reduce((acc, curr) => {
      if (curr[1].length !== 1) {
        throw new Error(`Invalid field assignment: ${acc}, ${curr}`);
      }

      if (curr[0].startsWith("departure")) {
        console.log(input.yourTicket[curr[1][0]]);
        return acc * input.yourTicket[curr[1][0]];
      }

      return acc;
    }, 1);
  });
});

type Field = {
  name: string;
  validRanges: { start: number; end: number }[];
};

type Ticket = number[];

type Input = {
  fields: Field[];
  yourTicket: Ticket;
  nearbyTickets: Ticket[];
};

function isValid(
  fields: Field[],
  ticket: Ticket
): { isValid: true } | { isValid: false; invalidValues: number[] } {
  const invalidEntries = ticket.filter((val) => {
    return !fields.some((field) => {
      return isValidForField(field, val);
    });
  });

  if (invalidEntries.length === 0) {
    return { isValid: true };
  }

  return { isValid: false, invalidValues: invalidEntries };
}

function isValidForField(field: Field, val: number): boolean {
  return field.validRanges.some((range) => {
    return val >= range.start && val <= range.end;
  });
}

function loadInput(inputFile = "input.txt"): Input {
  const field = (line: string) => {
    const fieldRegex = /^(.*): (\d+)-(\d+) or (\d+)-(\d+)/;

    const parsed = line.match(fieldRegex);
    if (!parsed) {
      return undefined;
    }

    return {
      name: parsed[1],
      validRanges: [
        { start: parseInt(parsed[2]), end: parseInt(parsed[3]) },
        { start: parseInt(parsed[4]), end: parseInt(parsed[5]) },
      ],
    };
  };

  return fs
    .readFileSync(path.join(__dirname, inputFile), "utf8")
    .split("\n")
    .reduce(
      (acc, curr) => {
        if (curr === "") {
          return acc;
        }

        const parsedField = field(curr);
        if (parsedField) {
          acc.fields.push(parsedField);
          return acc;
        }

        if (curr.match(/.*tickets?:/)) {
          return acc;
        }

        const ticket = curr.split(",").map((val) => parseInt(val));

        if (!acc.yourTicket) {
          acc.yourTicket = ticket;
        } else {
          acc.nearbyTickets.push(ticket);
        }

        return acc;
      },
      ({
        fields: [],
        yourTicket: undefined,
        nearbyTickets: [],
      } as unknown) as Input
    );
}
