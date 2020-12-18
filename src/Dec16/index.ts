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

    const result: (Field | undefined)[] = Array(
      filteredInput.fields.length
    ).fill(undefined);
    const fieldsUsed: { [field: string]: boolean } = {};

    let runs = 1;
    while (Object.entries(fieldsUsed).length !== result.length) {
      runs++;
      const getUnusedFields = (val: Set<Field>): Field[] => {
        return [...val].filter((field) => !fieldsUsed[field.name]);
      };

      fieldCandidates.forEach((val, idx) => {
        const unusedFields = getUnusedFields(val);
        console.log(unusedFields);
        if (unusedFields.length === 1) {
          result[idx] = unusedFields[0];
          fieldsUsed[unusedFields[0].name] = true;
        }
      });
    }

    console.log(runs, result);
    return result.reduce((acc, curr, idx) => {
      if (!curr) {
        throw new Error(`Malformed result`);
      }
      if (curr.name.startsWith("departure")) {
        return acc * input.yourTicket[idx];
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
