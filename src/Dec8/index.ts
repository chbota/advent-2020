import * as fs from "fs";
import * as path from "path";

export const VALID_INSTRUCTIONS = ["jmp", "acc", "nop"] as const;
export type Instruction = {
  type: typeof VALID_INSTRUCTIONS[number];
  arg: number;
};

export type Program = {
  instructions: Instruction[];
};

export type RuntimeState = {
  accum: number;
  instructionPtr: number;
};

export function runUntilRepeat(program: Program): RuntimeState {
  const seenInstructions: { [key: number]: boolean } = {};

  let runtime = { accum: 0, instructionPtr: 0 };
  while (!seenInstructions[runtime.instructionPtr]) {
    seenInstructions[runtime.instructionPtr] = true;
    runtime = runStep(program, runtime);
  }

  return runtime;
}

export function runStep(
  program: Program,
  runtime: RuntimeState = { accum: 0, instructionPtr: 0 }
): RuntimeState {
  if (runtime.instructionPtr >= program.instructions.length) {
    throw new Error(`Instruction out of bounds: ${runtime.instructionPtr}`);
  }

  const instruction = program.instructions[runtime.instructionPtr];

  const nextState = { ...runtime };
  switch (instruction.type) {
    case "acc":
      nextState.accum += instruction.arg;
      nextState.instructionPtr++;
      break;
    case "jmp":
      nextState.instructionPtr += instruction.arg;
      break;
    case "nop":
      nextState.instructionPtr++;
      break;
  }

  return nextState;
}

export function loadProgram(): Program {
  return {
    instructions: fs
      .readFileSync(path.join(__dirname, "input.txt"), "utf8")
      .split(/\n/)
      .map((entry) => {
        const match = entry.match(/(.{3}) (\+|-)(\d+)$/);
        if (!match || match.length !== 4) {
          throw new Error(`Malformed entry: ${entry}`);
        }

        if (
          !VALID_INSTRUCTIONS.includes(
            match[1] as typeof VALID_INSTRUCTIONS[number]
          )
        ) {
          throw new Error(`Unknown instruction: ${match[1]}`);
        }

        return {
          type: match[1],
          arg: match[2] === "-" ? -parseInt(match[3]) : parseInt(match[3]),
        } as Instruction;
      }),
  };
}
