import { FACTOR_CODES, FactorCode } from "./factors";
import { QUESTIONS, CROSS_CHECK_GROUPS } from "./questions";
import { FactorMatrix, BehavioralSignals } from "./layer1_2";

// ---------- LAYER 3 ----------
export interface Contradiction {
  pairId: string;
  factor: FactorCode;
  questionA: number;
  questionB: number;
  valueA: number;
  valueB: number;
  magnitude: number;
}

const CONTRADICTION_THRESHOLD = 0.6;

export function layer3ContradictionDetection(matrix: FactorMatrix): Contradiction[] {
  const contradictions: Contradiction[] = [];

  for (const pairId of CROSS_CHECK_GROUPS) {
    const pairQuestions = QUESTIONS.filter((q) => q.crossCheckPairId === pairId);
    if (pairQuestions.length !== 2) continue;
    const [qA, qB] = pairQuestions;

    // Tìm yếu tố chung có trọng số ở cả 2 câu (yếu tố cross-check chính)
    const factorsA = Object.keys(matrix[qA.id] ?? {}) as FactorCode[];
    const factorsB = new Set(Object.keys(matrix[qB.id] ?? {}));
    const sharedFactors = factorsA.filter((f) => factorsB.has(f));

    for (const factor of sharedFactors) {
      const valueA = matrix[qA.id]?.[factor] ?? 0;
      const valueB = matrix[qB.id]?.[factor] ?? 0;
      const magnitude = Math.abs(valueA - valueB);
      if (magnitude > CONTRADICTION_THRESHOLD) {
        contradictions.push({ pairId, factor, questionA: qA.id, questionB: qB.id, valueA, valueB, magnitude });
      }
    }
  }
  return contradictions;
}

// ---------- LAYER 4 ----------
export interface ConfidenceResult {
  perFactor: Partial<Record<FactorCode, number>>;
  overall: number;
  reliabilityTier: "cao" | "trung bình" | "cần xem lại một số câu";
}

const DRIFT_WEIGHT = 0.3;
const CONTRA_WEIGHT = 0.2;
const LATENCY_PENALTY_CAP = 0.15;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function layer4ConfidenceScoring(
  behavioral: BehavioralSignals,
  contradictions: Contradiction[]
): ConfidenceResult {
  const perFactor: Partial<Record<FactorCode, number>> = {};

  for (const factor of FACTOR_CODES) {
    let confidence = 1.0;

    const drift = behavioral.driftByFactor[factor] ?? 0;
    confidence -= drift * DRIFT_WEIGHT;

    const related = contradictions.filter((c) => c.factor === factor);
    const contraPenalty = related.reduce((sum, c) => sum + c.magnitude, 0) * CONTRA_WEIGHT;
    confidence -= contraPenalty;

    if (behavioral.positionBiasFlag) confidence -= 0.15;

    perFactor[factor] = clamp(confidence, 0, 1);
  }

  const values = Object.values(perFactor) as number[];
  const overall = values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);

  const reliabilityTier: ConfidenceResult["reliabilityTier"] =
    overall >= 0.75 ? "cao" : overall >= 0.55 ? "trung bình" : "cần xem lại một số câu";

  return { perFactor, overall, reliabilityTier };
}
