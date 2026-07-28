import { getSupabaseServerClient } from "@/lib/supabase";
import { ARCHETYPES } from "@/lib/scoring/archetypes";
import ResultView from "./ResultView";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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

  // Chỉ trích xuất 3 nghề phù hợp dạng tên ngắn từ text đầy đủ (teaser, không lộ lý do chi tiết)
  const careersTeaser: string[] =
    typeof report?.suitableCareers === "string"
      ? report.suitableCareers
          .split(/[\n,.]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 2 && s.length < 40)
          .slice(0, 3)
      : [];

  const strengthsTeaser: string[] =
    typeof report?.topStrengths === "string"
      ? report.topStrengths
          .split(/\n/)
          .map((s: string) => s.trim())
          .filter(Boolean)
          .slice(0, 3)
      : [];

  return (
    <ResultView
      code={data.code}
      archetypeName={data.archetype_name}
      badgeColor={archetype?.badgeColor ?? "#E8837B"}
      shortDescription={archetype?.shortDescription ?? ""}
      populationPercentile={data.population_percentile}
      summary={report?.summary ?? ""}
      strengthsTeaser={strengthsTeaser}
      careersTeaser={careersTeaser}
      unlocked={data.unlocked}
      delivered={data.delivered}
    />
  );
}
