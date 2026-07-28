import { FACTOR_CODES, FactorCode } from "./factors";
import { QUESTIONS } from "./questions";

export interface RawAnswer {
  questionId: number;
  choiceIndex: 0 | 1 | 2 | 3;
  responseTimeMs: number;
}

export type FactorMatrix = Record<number, Partial<Record<FactorCode, number>>>; // questionId -> weights

// ---------- LAYER 1 ----------
export function layer1Aggregate(answers: RawAnswer[]): FactorMatrix {
  const matrix: FactorMatrix = {};
  for (const answer of answers) {
    const question = QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    const choice = question.choices[answer.choiceIndex];
    matrix[answer.questionId] = choice.weights;
  }
  return matrix;
}

// ---------- LAYER 2 ----------
export interface BehavioralSignals {
  latencyZByQuestion: Record<number, number>;
  driftByFactor: Partial<Record<FactorCode, number>>;
  positionBiasFlag: boolean;
  positionCounts: [number, number, number, number];
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / Math.max(nums.length, 1);
}
function stddev(nums: number[]): number {
  const m = mean(nums);
  return Math.sqrt(mean(nums.map((n) => (n - m) ** 2))) || 1;
}

// Population baseline giả định (MVP: hằng số hợp lý, có thể thay bằng dữ liệu thật khi đủ traffic)
const ASSUMED_MEAN_MS = 6000;
const ASSUMED_STD_MS = 3000;

export function layer2BehavioralAnalysis(answers: RawAnswer[], matrix: FactorMatrix): BehavioralSignals {
  const latencyZByQuestion: Record<number, number> = {};
  for (const a of answers) {
    latencyZByQuestion[a.questionId] = (a.responseTimeMs - ASSUMED_MEAN_MS) / ASSUMED_STD_MS;
  }

  const driftByFactor: Partial<Record<FactorCode, number>> = {};
  for (const factor of FACTOR_CODES) {
    const relatedQuestions = QUESTIONS.filter((q) => q.choices.some((c) => factor in c.weights));
    const values = relatedQuestions
      .map((q) => matrix[q.id]?.[factor])
      .filter((v): v is number => v !== undefined);
    if (values.length >= 2) {
      driftByFactor[factor] = stddev(values);
    }
  }

  const positionCounts: [number, number, number, number] = [0, 0, 0, 0];
  for (const a of answers) positionCounts[a.choiceIndex]++;
  const total = answers.length || 1;
  const maxShare = Math.max(...positionCounts) / total;
  const positionBiasFlag = maxShare > 0.6;

  return { latencyZByQuestion, driftByFactor, positionBiasFlag, positionCounts };
}
