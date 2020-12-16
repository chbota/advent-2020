import { readFileSync } from "fs";
import * as path from "path";
import { day, measurePerf } from "../utils";

day(14, () => {
  const program = loadProgram();

  const updateBitmask = (instr: Instruction, runtime: Runtime): Runtime => {
    if (instr.type !== InstructionType.UpdateBitmask) {
      return runtime;
    }
    runtime.mask = instr.mask;
    return runtime;
  };

  const setMemoryWithAdjustedValue = (
    instr: Instruction,
    runtime: Runtime
  ): Runtime => {
    if (instr.type !== InstructionType.SetMemory) {
      return runtime;
    }

    let updatedVal: bigint = instr.value;

    if (runtime.mask) {
      updatedVal = runtime.mask.orMask | updatedVal;
      updatedVal = runtime.mask.andMask & updatedVal;
    }

    runtime.memory.set(instr.address, updatedVal);

    return runtime;
  };

  const setMemoryWithAdjustedAddress = (
    instr: Instruction,
    runtime: Runtime
  ): Runtime => {
    if (instr.type !== InstructionType.SetMemory) {
      return runtime;
    }

    if (!runtime.mask) {
      throw new Error("Missing mask");
    }

    for (const [idx, mask] of runtime.mask.floatingOrMasks.entries()) {
      let instrAddr =
        (mask | instr.address) & runtime.mask.floatingAndMasks[idx];
      runtime.memory.set(instrAddr, instr.value);
    }

    return runtime;
  };

  measurePerf("Problem 1", () => {
    const result = runProgram(program, {
      [InstructionType.SetMemory]: setMemoryWithAdjustedValue,
      [InstructionType.UpdateBitmask]: updateBitmask,
    });

    return sumValues(result);
  });

  measurePerf("Problem 2", () => {
    const result = runProgram(program, {
      [InstructionType.SetMemory]: setMemoryWithAdjustedAddress,
      [InstructionType.UpdateBitmask]: updateBitmask,
    });

    return sumValues(result);
  });
});

const enum InstructionType {
  UpdateBitmask,
  SetMemory,
}

type Bitmask = {
  orMask: bigint;
  andMask: bigint;
  floatingOrMasks: bigint[];
  floatingAndMasks: bigint[];
};
type SetMemory = {
  type: InstructionType.SetMemory;
  address: bigint;
  value: bigint;
};
type UpdateBitmask = { type: InstructionType.UpdateBitmask; mask: Bitmask };
type Instruction = SetMemory | UpdateBitmask;

type Runtime = {
  memory: Map<bigint, bigint>;
  mask: Bitmask | undefined;
};

type InstructionRunners = Record<
  InstructionType,
  (instr: Instruction, runtime: Runtime) => Runtime
>;

function runProgram(
  program: Instruction[],
  instructionImpls: InstructionRunners
): Runtime {
  return program.reduce(
    (acc: Runtime, instruction: Instruction) =>
      instructionImpls[instruction.type](instruction, acc),
    {
      memory: new Map<bigint, bigint>(),
      mask: undefined,
    } as Runtime
  );
}

function sumValues(runtime: Runtime): bigint {
  let sum = 0n;
  for (const val of runtime.memory.values()) {
    sum += val;
  }

  return sum;
}

function loadProgram(): Instruction[] {
  const memoryInstr = (entry: string): SetMemory | undefined => {
    const setMemoryRegex = /^mem\[(\d+)\] = (\d+)$/;

    const parsedRes = entry.match(setMemoryRegex);
    if (!parsedRes) {
      return undefined;
    }

    return {
      type: InstructionType.SetMemory,
      address: BigInt(parseInt(parsedRes[1])),
      value: BigInt(parseInt(parsedRes[2])),
    };
  };

  const bitmaskInstr = (entry: string): UpdateBitmask | undefined => {
    const updateBitmaskRegex = /^mask = ([0|1|X]+)$/;

    const parsedRes = entry.match(updateBitmaskRegex);
    if (!parsedRes) {
      return undefined;
    }

    const parseBigInt = (binary: string): bigint => {
      let result = BigInt(parseInt(binary.substr(0, 32), 2));
      const rest = BigInt(parseInt(binary.substr(32), 2));
      return (result << 4n) | rest;
    };

    const getCombos = (base: string, indices: number[]): bigint[] => {
      if (indices.length === 0) {
        return [parseBigInt(base)];
      }

      const currentIndex = indices[0];
      const remainder = indices.slice(1);
      const baseArray = Array.from(base);

      baseArray[currentIndex] = "0";
      const firstCombo = baseArray.join("");
      baseArray[currentIndex] = "1";
      const secCombo = baseArray.join("");

      const result: bigint[] = [];
      result.push(...getCombos(firstCombo, remainder));
      result.push(...getCombos(secCombo, remainder));

      return result;
    };

    const orMask = parsedRes[1].replace(/X/g, "0");
    const andMask = parsedRes[1].replace(/X/g, "1");

    const xIndices = [];
    for (const [idx, bin] of Array.from(parsedRes[1]).entries()) {
      if (bin === "X") {
        xIndices.push(idx);
      }
    }

    const base = parsedRes[1].replace(/X/g, "0");
    const floatingOrMasks = getCombos(base, xIndices);
    const floatingAndMasks = getCombos(base.replace(/0/g, "1"), xIndices);

    return {
      type: InstructionType.UpdateBitmask,
      mask: {
        orMask: parseBigInt(orMask),
        andMask: parseBigInt(andMask),
        floatingOrMasks,
        floatingAndMasks,
      },
    };
  };

  return readFileSync(path.join(__dirname, "./input.txt"), "utf8")
    .split("\n")
    .map((entry) => {
      const parsedMemInstr = memoryInstr(entry);
      if (parsedMemInstr) {
        return parsedMemInstr;
      }

      const parsedBitmaskInstr = bitmaskInstr(entry);
      if (parsedBitmaskInstr) {
        return parsedBitmaskInstr;
      }

      throw new Error(`Unexpected entry: ${entry}`);
    });
}
