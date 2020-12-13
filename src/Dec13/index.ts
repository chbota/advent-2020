import * as fs from 'fs';
import * as path from "path";
import { day, measurePerf } from '../utils';

day(13, () => {
	const input = loadData();
	console.log(input);
	measurePerf('Problem 1', () => {
		const earliestBus = getEarliestBusToAirport(input);
		console.log(earliestBus);
		return (earliestBus.time - input.earliestDeparture) * earliestBus.bus;
	});
})

type Input = {
	earliestDeparture: number;
	buses: number[]
};

function getEarliestBusToAirport(input: Input): { time: number, bus: number} {
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



function loadData(): Input {
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