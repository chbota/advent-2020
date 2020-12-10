import * as path from "path";
import * as fs from "fs";
import { day } from "../Utils";

day(6, () => {
  const allAnswers = loadAnswers();
  const questionsAnsweredByAnyone = allAnswers.map(getQuestionsAnyoneAnswered);
  const questionsAnsweredByEveryone = allAnswers.map(
    getQuestionsEveryoneAnswered
  );

  const sumAnswerCount = (answers: string[][]) =>
    answers.map((val) => val.length).reduce((accum, curr) => accum + curr, 0);

  console.log(sumAnswerCount(questionsAnsweredByAnyone));
  console.log(sumAnswerCount(questionsAnsweredByEveryone));
});

export function loadAnswers(): string[] {
  return fs
    .readFileSync(path.join(__dirname, "input.txt"), "utf8")
    .split(/\s{2}/);
}

function getAnswerMap(
  individualAnswerSets: string[]
): { [question: string]: number } {
  const answerMap: { [question: string]: number } = {};

  for (const answerSet of individualAnswerSets) {
    for (const answer of answerSet) {
      if (answerMap[answer]) {
        answerMap[answer]++;
      } else {
        answerMap[answer] = 1;
      }
    }
  }

  return answerMap;
}

export function getQuestionsAnyoneAnswered(groupAnswers: string): string[] {
  return Object.keys(getAnswerMap(groupAnswers.split(/\s/)));
}

export function getQuestionsEveryoneAnswered(groupAnswers: string): string[] {
  const answerSets = groupAnswers.split(/\s/);
  const answerMap = getAnswerMap(answerSets);

  return Object.keys(answerMap).filter(
    (val) => answerMap[val] === answerSets.length
  );
}
