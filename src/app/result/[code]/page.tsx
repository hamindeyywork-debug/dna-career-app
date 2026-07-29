import { getSupabaseServerClient } from "@/lib/supabase";
import { ARCHETYPES } from "@/lib/scoring/archetypes";
import ResultView from "./ResultView";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function splitList(text: unknown, max: number): string[] {
  if (typeof text !== "string" || !text.trim()) return [];
  // Tách theo số thứ tự (1. 2. 3.), gạch đầu dòng, hoặc xuống dòng — tùy AI trả về kiểu nào
  const parts = text
    .split(/\n+|(?=\d\.\s)/)
    .map((s) => s.replace(/^[\d.\-•\s]+/, "").trim())
    .filter((s) => s.length > 3);
  return parts.slice(0, max);
}

export default async function ResultPage({ params }: { params: { code: string } }) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("dna_results")
    .select("code, archetype_id, archetype_name, population_percentile, report, unlocked, delivered")
    .eq("code", params.code)
    .single();

  if (error || !data) return notFound();

  const archetype = ARCHETYPES.find((a) => a.id === data.archetype_id);
  const report = data.report as any;

  const strengthsTeaser = splitList(report?.topStrengths, 3);
  const careersTeaser = splitList(report?.suitableCareers, 3);

  return (
    <ResultView
      code={data.code}
      archetypeName={data.archetype_name}
      badgeColor={archetype?.badgeColor ?? "#C2485C"}
      shortDescription={archetype?.shortDescription ?? ""}
      populationPercentile={data.population_percentile}
      summary={typeof report?.summary === "string" ? report.summary : ""}
      strengthsTeaser={strengthsTeaser}
      careersTeaser={careersTeaser}
      unlocked={data.unlocked}
      delivered={data.delivered}
    />
  );
}
