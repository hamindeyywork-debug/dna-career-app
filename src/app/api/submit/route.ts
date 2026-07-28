import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { runFullPipeline } from "@/lib/scoring/pipeline";
import { RawAnswer } from "@/lib/scoring/layer1_2";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const answers: RawAnswer[] = body.answers;
    const referralSource: string | undefined = body.referralSource;
    const referredByCode: string | undefined = body.referredByCode;

    if (!Array.isArray(answers) || answers.length !== 40) {
      return NextResponse.json({ error: "Cần đúng 40 câu trả lời." }, { status: 400 });
    }

    const result = await runFullPipeline(answers);
    const code = `DNA-${nanoid(6).toUpperCase()}`;

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("dna_results").insert({
      code,
      archetype_id: result.archetype.id,
      archetype_name: result.archetype.name,
      vector: result.vector,
      population_percentile: result.populationPercentile,
      overall_confidence: result.overallConfidence,
      reliability_tier: result.reliabilityTier,
      contradictions_count: result.contradictionsCount,
      raw_answers: answers,
      report: result.report,
      referral_source: referralSource ?? null,
      referred_by_code: referredByCode ?? null,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Không thể lưu kết quả." }, { status: 500 });
    }

    await supabase.from("events_log").insert({ code, event_type: "complete_test" });

    // Chỉ trả về 30% cho client — badge, top 3 điểm mạnh (rút từ summary), 3 nghề phù hợp
    return NextResponse.json({
      code,
      archetypeName: result.archetype.name,
      badgeColor: result.archetype.badgeColor,
      shortDescription: result.archetype.shortDescription,
      populationPercentile: result.populationPercentile,
      preview: {
        summary: result.report.summary,
        suitableCareersTeaser: result.report.suitableCareers?.split(".")[0] ?? "",
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Lỗi không xác định." }, { status: 500 });
  }
}
