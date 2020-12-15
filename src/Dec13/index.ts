import * as fs from 'fs';
import * as path from "path";
import { day, measurePerf } from '../utils';

day(13, () => {
	const input1 = loadDataProblem1();
	console.log(input1);
	measurePerf('Problem 1', () => {
		const earliestBus = getEarliestBusToAirport(input1);
		console.log(earliestBus);
		return (earliestBus.time - input1.earliestDeparture) * earliestBus.bus;
	});

	measurePerf('Problem 2', () => {
		const input = loadDataProblem2();
		let currentTime = 1;
		let runningCommonMultipleTimeOffset = 1;

		for (const [idx, bus] of input.entries()) {
			if (bus === -1) {
				continue;
			}

			while ((currentTime + idx) % bus !== 0) {
				// Search in the future - fast forward by already found
				// common multiple
				currentTime += runningCommonMultipleTimeOffset;
			}

			// multiply the bus into the running common multiple to
			// find a new common multiple
			runningCommonMultipleTimeOffset *= bus;			
		}

		return currentTime;
	});
})


//#region problem 1

type Input1 = {
	earliestDeparture: number;
	buses: number[]
};

function getEarliestBusToAirport(input: Input1): { time: number, bus: number} {
	let earliestDeparture = -1;
	let earliestBus = -1;

	for (const bus of input.buses) {
		const timeWaitTillNextDeparture = bus - (input.earliestDeparture % bus);
		const nextDeparture = timeWaitTillNextDeparture + input.earliestDeparture;

		if (nextDeparture < earliestDeparture || earliestDeparture === -1) {
			console.log(nextDeparture, bus);
			earliestDeparture = nextDeparture;
			earliestBus = bus;
		}
	}

	if (earliestBus === -1 || earliestDeparture === -1) {
		throw new Error("Found no bus to airport");
	}

	return { time: earliestDeparture, bus: earliestBus };
}



function loadDataProblem1(): Input1 {
	return fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8').split(/\s/).reduce((acc, curr, idx) => {
		if (idx === 0) {
			acc.earliestDeparture = parseInt(curr);
		} else if (idx === 1) {
			acc.buses = curr.split(',').filter(val => val !== 'x').map(val => parseInt(val));
		}
		return acc;
	}, {
		earliestDeparture: -1,
		buses: [] as number[]
	});
}

//#endregion

//#region problem 2

type Input2 = number[];

function loadDataProblem2(): Input2 {
	return fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8').split(/\s/).reduce((acc, curr, idx) => {
		if (idx === 0) {
			return acc;
		} else if (idx === 1) {
			return curr.split(',').map(val => {
				if (val === 'x') {
					return -1;
				}
				
				return parseInt(val)
			})	
		}
		return acc;
	}, [] as number[]);
}

function isValidStartingTime(startingTime: number, input: Input2): boolean {
	let currentTime = startingTime;
	for (const busEntry of input) {
		if (currentTime % busEntry !== 0) {
			return false;
		}
		
		currentTime++;
	}

	return true;
}

//#endregion