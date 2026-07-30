import { GoogleGenAI } from "@google/genai";
import { FACTOR_CODES, FACTORS, FactorCode } from "./factors";
import { FactorMatrix } from "./layer1_2";
import { ConfidenceResult } from "./layer3_4";
import { ARCHETYPES, findNearestArchetype, Archetype } from "./archetypes";
import { Contradiction } from "./layer3_4";

// ---------- LAYER 5a: normalize + classify (rule-based, không cần AI) ----------
export function normalizeVector(matrix: FactorMatrix, confidence: ConfidenceResult): Partial<Record<FactorCode, number>> {
  const sums: Partial<Record<FactorCode, number>> = {};
  const counts: Partial<Record<FactorCode, number>> = {};

  for (const weights of Object.values(matrix)) {
    for (const [factor, weight] of Object.entries(weights) as [FactorCode, number][]) {
      sums[factor] = (sums[factor] ?? 0) + weight;
      counts[factor] = (counts[factor] ?? 0) + 1;
    }
  }

  const normalized: Partial<Record<FactorCode, number>> = {};
  for (const factor of FACTOR_CODES) {
    const count = counts[factor] ?? 0;
    if (count > 0) {
      normalized[factor] = (sums[factor]! / count) * (confidence.perFactor[factor] ?? 1);
    } else {
      normalized[factor] = 0;
    }
  }
  return normalized;
}

export function calculatePercentile(vector: Partial<Record<FactorCode, number>>, archetype: Archetype): number {
  // MVP: ước lượng độ hiếm dựa trên khoảng cách tới tâm archetype (không dùng phân bố dân số thật)
  const { distance } = findNearestArchetype(vector);
  const rarity = clampPercentile(Math.round(20 - distance * 30));
  return rarity;
}
function clampPercentile(n: number) {
  return Math.max(3, Math.min(35, n));
}

export function layer5aClassify(matrix: FactorMatrix, confidence: ConfidenceResult) {
  const normalized = normalizeVector(matrix, confidence);
  const { archetype, distance } = findNearestArchetype(normalized);
  const populationPercentile = calculatePercentile(normalized, archetype);
  return { normalized, archetype, distance, populationPercentile };
}

// ---------- LAYER 5b: sinh nội dung cá nhân hóa (gọi Claude API) ----------
export interface ReportSections {
  summary: string;
  topStrengths: string;
  blindSpots: string;
  suitableCareers: string;
  idealEnvironment: string;
  commonMistakes: string;
  ninetyDayPlan: string;
}

function topFactors(vector: Partial<Record<FactorCode, number>>, n: number): string {
  const entries = Object.entries(vector) as [FactorCode, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries
    .slice(0, n)
    .map(([code, val]) => `${FACTORS[code].name} (${val.toFixed(2)})`)
    .join(", ");
}

function describeContradictions(contradictions: Contradiction[]): string {
  if (contradictions.length === 0) return "Không phát hiện mâu thuẫn đáng kể trong dữ liệu.";
  return contradictions
    .map(
      (c) =>
        `Yếu tố ${FACTORS[c.factor].name}: chênh lệch ${c.magnitude.toFixed(2)} giữa câu ${c.questionA} và câu ${c.questionB}`
    )
    .join("; ");
}

export async function layer5bGenerateReport(params: {
  archetype: Archetype;
  vector: Partial<Record<FactorCode, number>>;
  contradictions: Contradiction[];
  reliabilityTier: string;
}): Promise<ReportSections> {
  const { archetype, vector, contradictions, reliabilityTier } = params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu GEMINI_API_KEY trong biến môi trường.");
  }
  const client = new GoogleGenAI({ apiKey });

  const prompt = `Bạn là chuyên gia career coaching, viết báo cáo DNA Career cho một người dùng nữ 22-32 tuổi tại Việt Nam.

DNA Type: ${archetype.name} — ${archetype.shortDescription}
3 yếu tố nổi bật nhất: ${topFactors(vector, 3)}
Mâu thuẫn hành vi phát hiện được (dùng cho phần Điểm mù): ${describeContradictions(contradictions)}
Độ tin cậy dữ liệu: ${reliabilityTier}

Giọng văn: thẳng thắn, thực tế, như một người chị từng trải — tuyệt đối không dùng ngôn ngữ tử vi mơ hồ, mỗi câu phải gắn với hành vi cụ thể.

Trả lời CHÍNH XÁC theo định dạng JSON sau, không thêm text nào khác ngoài JSON:
{
  "summary": "đoạn tóm tắt DNA (3-4 câu)",
  "topStrengths": "3 điểm mạnh nhất, mỗi điểm 1-2 câu",
  "blindSpots": "điểm mù dựa trên mâu thuẫn phát hiện được (3-4 câu)",
  "suitableCareers": "3 nghề phù hợp kèm lý do ngắn gọn",
  "idealEnvironment": "môi trường làm việc lý tưởng (3-4 câu)",
  "commonMistakes": "2-3 sai lầm dễ mắc phải",
  "ninetyDayPlan": "kế hoạch phát triển 90 ngày chia 3 giai đoạn 30 ngày"
}`;

  const response = await client.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: { maxOutputTokens: 4000, responseMimeType: "application/json" },
  });

  const rawText = response.text ?? "{}";
  let cleaned = rawText.replace(/```json|```/g, "").trim();

  // Trích đúng khối {...} đầu tiên tới cuối cùng, phòng trường hợp model
  // thêm text thừa trước/sau JSON dù đã ép responseMimeType
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleaned) as ReportSections;
    // Đảm bảo mọi field đều là string, tránh undefined làm vỡ giao diện
    return {
      summary: parsed.summary ?? "",
      topStrengths: parsed.topStrengths ?? "",
      blindSpots: parsed.blindSpots ?? "",
      suitableCareers: parsed.suitableCareers ?? "",
      idealEnvironment: parsed.idealEnvironment ?? "",
      commonMistakes: parsed.commonMistakes ?? "",
      ninetyDayPlan: parsed.ninetyDayPlan ?? "",
    };
  } catch {
    // In log để có thể xem trong Vercel > Logs nếu cần debug tiếp
    console.error("[layer5b] Gemini không trả về JSON hợp lệ. Raw text:", rawText.slice(0, 500));
    // Fallback: KHÔNG BAO GIỜ hiển thị JSON thô ra người dùng —
    // trả về thông điệp trung tính, an toàn để hiển thị.
    return {
      summary:
        "DNA Career của bạn đã được phân tích xong. Bấm mở khóa để nhận báo cáo đầy đủ từ Hamin nhé.",
      topStrengths: "",
      blindSpots: "",
      suitableCareers: "",
      idealEnvironment: "",
      commonMistakes: "",
      ninetyDayPlan: "",
    };
  }
}
