import { readFileSync } from 'fs';
import * as path from 'path';
import { day, measurePerf } from '../utils';


day(14, () => {
	const program = loadProgram();

	measurePerf("Problem 1", () => {
		const result = runProgram(program);

		return Object.values(result.memory).reduce((acc, curr) => acc + curr, 0n);
	});
});


const enum InstructionType {
	UpdateBitmask,
	SetMemory
}

type Bitmask = { orMask: bigint; andMask: bigint };
type SetMemory = { type: InstructionType.SetMemory; address: number; value: bigint; };
type UpdateBitmask = { type: InstructionType.UpdateBitmask, mask: Bitmask };
type Instruction = SetMemory | UpdateBitmask;

type Runtime = {
	memory: { [key: bigint]: bigint};
	mask: Bitmask | undefined;
};

function runProgram(program: Instruction[]): Runtime {
	return program.reduce((acc: Runtime, instruction: Instruction) => {		
		switch(instruction.type) {
			case InstructionType.SetMemory:
				let updatedVal: bigint = instruction.value;

				if (acc.mask) {
					updatedVal = acc.mask.orMask | updatedVal;
					updatedVal = acc.mask.andMask & updatedVal;
				}

				acc.memory[instruction.address] = updatedVal;
				break;
			case InstructionType.UpdateBitmask:
				acc.mask = instruction.mask;	
				break;
		}
		
		return acc;
	}, 
	{
		memory: {},
		mask: undefined
	} as Runtime);
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
			address: parseInt(parsedRes[1]),
			value: BigInt(parseInt(parsedRes[2]))
		}
	}
	
	const bitmaskInstr = (entry: string): UpdateBitmask | undefined => {
		const updateBitmaskRegex = /^mask = ([0|1|X]+)$/;

		const parsedRes = entry.match(updateBitmaskRegex);
		if (!parsedRes) {
			return undefined;
		}

		const parse36bitBinaryTobigint = (binary: string): bigint => {
			let result = BigInt(parseInt(binary.substr(0, 32), 2));
			const rest = BigInt(parseInt(binary.substr(32), 2));
			return (result << 4n) | rest;
		}

		const orMask = parsedRes[1].replace(/X/g, '0');
		const andMask = parsedRes[1].replace(/X/g, '1');

		return {
			type: InstructionType.UpdateBitmask,
			mask: {
				orMask: parse36bitBinaryTobigint(orMask),
				andMask: parse36bitBinaryTobigint(andMask)
			}
		};
	}	

	return readFileSync(path.join(__dirname, './input.txt'), "utf8").split('\n').map((entry) => {
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