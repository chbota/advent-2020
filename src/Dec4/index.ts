import * as fs from 'fs';
import * as path from 'path';

/*
byr (Birth Year)
iyr (Issue Year)
eyr (Expiration Year)
hgt (Height)
hcl (Hair Color)
ecl (Eye Color)
pid (Passport ID)
cid (Country ID)
*/
export interface Passport {
    byr?: string;
    iyr?: string;
    eyr?: string;
    hgt?: string;
    hcl?: string;
    ecl?: string;
    pid?: string;
    cid?: string;
}

export type PassportPolicy = Record<keyof Passport, (val?: string) => boolean>;

export function isValidPassport(passport: Passport, policy: PassportPolicy) {
    return Object.entries(policy).every((fieldRule) => {
        return fieldRule[1](passport[fieldRule[0] as keyof Passport]);
    });
}

export function countValidPassports(passports: Passport[], policy: PassportPolicy): number {
    return passports.reduce((runningCount, curr) => {
        if (isValidPassport(curr, policy)) {
            runningCount++;
        }
        return runningCount;
    }, 0);
}


// passport policies

const isNotUndefined = (val?: string) => val !== undefined;
const isNumberInRange = (minVal: number, maxVal: number) => {
    return (val?: string) => {
        if (val === undefined) {
            return false;
        }
        const parsedVal = parseInt(val);
        return parsedVal >= minVal && parsedVal <= maxVal;
    }
}
const isHexColor = (val?: string) => {
    return val !== undefined && /^#[a-f\d]{6}$/.test(val);
}
const isInSet = (set: string[]) => {
    return (val?: string) => val !== undefined && set.includes(val)
}
const isValidPassportId = (val?: string) => {
    return val !== undefined && /^\d{9}$/.test(val);
}
const isValidHeight = (val?: string) => {
    if (!val) {
        return false;
    }

    const match = /^(\d+)(cm|in)$/.exec(val);
    if (!match || match.length !== 3) {
        return false;
    }

    const parsedHeight = parseInt(match[1]);
    if (match[2] === 'cm') {
        return parsedHeight >= 150 && parsedHeight <= 193;
    }

    if (match[2] === 'in') {
        return parsedHeight >= 59 && parsedHeight <= 76;
    }

    return false;
}


export const passportPolicy1: PassportPolicy = {
    byr: isNotUndefined,
    iyr: isNotUndefined,
    eyr: isNotUndefined,
    hgt: isNotUndefined,
    hcl: isNotUndefined,
    ecl: isNotUndefined,
    pid: isNotUndefined,
    cid: () => true
};

export const passportPolicy2: PassportPolicy = {
    byr: isNumberInRange(1920, 2002),
    iyr: isNumberInRange(2010, 2020),
    eyr: isNumberInRange(2020, 2030),
    hgt: isValidHeight,
    hcl: isHexColor,
    ecl: isInSet(['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth']),
    pid: isValidPassportId,
    cid: () => true
};

// data loading

export function loadPassports(): Passport[] {
    return loadSerializedPassports().map((val) => {
        return val.split(/\s/).reduce<Passport>((passport, field) => {
            const separatorIndex = field.indexOf(':');
            if (separatorIndex >= 0) {
                passport[field.substr(0, separatorIndex) as keyof Passport] = field.substr(separatorIndex + 1);
            } else {
                console.error(`Malformed passport entry: ${field}`);
            }

            return passport;
        }, {});
    });
}

function loadSerializedPassports(): string[] {
    return fs.readFileSync(path.join(__dirname, "input.txt"), { encoding: 'utf8' }).split('\n\n');
}
