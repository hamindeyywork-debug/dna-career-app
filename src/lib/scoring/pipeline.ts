import { RawAnswer, layer1Aggregate, layer2BehavioralAnalysis } from "./layer1_2";
import { layer3ContradictionDetection, layer4ConfidenceScoring } from "./layer3_4";
import { layer5aClassify, layer5bGenerateReport, ReportSections } from "./layer5";
import { Archetype } from "./archetypes";
import { FactorCode } from "./factors";

export interface PipelineResult {
  vector: Partial<Record<FactorCode, number>>;
  archetype: Archetype;
  populationPercentile: number;
  reliabilityTier: string;
  overallConfidence: number;
  contradictionsCount: number;
  report: ReportSections;
}

export async function runFullPipeline(answers: RawAnswer[]): Promise<PipelineResult> {
  const matrix = layer1Aggregate(answers);
  const behavioral = layer2BehavioralAnalysis(answers, matrix);
  const contradictions = layer3ContradictionDetection(matrix);
  const confidence = layer4ConfidenceScoring(behavioral, contradictions);
  const { normalized, archetype, populationPercentile } = layer5aClassify(matrix, confidence);
  const report = await layer5bGenerateReport({
    archetype,
    vector: normalized,
    contradictions,
    reliabilityTier: confidence.reliabilityTier,
  });

  return {
    vector: normalized,
    archetype,
    populationPercentile,
    reliabilityTier: confidence.reliabilityTier,
    overallConfidence: confidence.overall,
    contradictionsCount: contradictions.length,
    report,
  };
}
