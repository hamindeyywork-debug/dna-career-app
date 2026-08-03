import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
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
export interface NinetyDayWeek {
  weekLabel: string; // vd. "Tuần 1-2"
  actions: [string, string, string];
}
export interface NinetyDayStage {
  stageLabel: string; // vd. "Giai đoạn 1: Ngày 1-30 - Nhận diện điểm mù"
  weeks: NinetyDayWeek[];
}

export interface ReportSections {
  summary: string;
  topStrengths: string;
  blindSpots: string;
  suitableCareers: string;
  idealEnvironment: string;
  commonMistakes: string;
  ninetyDayPlan: NinetyDayStage[];
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

Giọng văn: thẳng thắn, thực tế, như một người chị từng trải — tuyệt đối không dùng ngôn ngữ tử vi mơ hồ, mỗi câu phải gắn với hành vi cụ thể. LUÔN xưng hô người đọc là "bạn" (không dùng "em").

YÊU CẦU ĐỘ SÂU (quan trọng):
- Mỗi nhận định phải giải thích RÕ TẠI SAO dựa trên đúng yếu tố DNA của người này, không viết chung chung có thể áp dụng cho bất kỳ ai.
- TUYỆT ĐỐI KHÔNG được viết ra bất kỳ con số thập phân/điểm số thô nào (VD: "0.54", "điểm 0.51", "chỉ số 0.7") — người đọc không biết thang điểm này là gì nên sẽ gây khó hiểu. Thay vào đó dùng ngôn ngữ định tính: "cao", "vượt trội", "rất mạnh", "nổi bật hơn hẳn".
- Với các mục có nhiều ý (topStrengths, suitableCareers, commonMistakes): BẮT BUỘC xuống dòng (\\n\\n) giữa mỗi ý đánh số, mỗi ý dài 2-3 câu.
- Nếu có ví dụ minh họa trong mỗi ý, LUÔN bắt đầu bằng "Ví dụ: " và đặt câu ví dụ đó xuống dòng riêng (thêm \\n trước "Ví dụ:"), tách biệt với câu giải thích chính phía trên.
- ninetyDayPlan là DỮ LIỆU CÓ CẤU TRÚC (không phải văn bản tự do): gồm 3 giai đoạn (Ngày 1-30, 31-60, 61-90), mỗi giai đoạn có 2-3 tuần, mỗi tuần có ĐÚNG 3 hành động cụ thể (bắt đầu bằng động từ hành động, có thể lồng ngắn gọn lý do phù hợp DNA ngay trong câu). Xem đúng cấu trúc JSON yêu cầu bên dưới, không tự ý đổi thành chuỗi văn bản.

Trả lời CHÍNH XÁC theo định dạng JSON sau, không thêm text nào khác ngoài JSON:
{
  "summary": "đoạn tóm tắt DNA (4-5 câu), xưng \"bạn\"",
  "topStrengths": "3 điểm mạnh nhất, đánh số 1. 2. 3., mỗi điểm 2-3 câu kèm ví dụ hành vi cụ thể, MỖI Ý CÁCH NHAU BẰNG \\n\\n",
  "blindSpots": "điểm mù dựa trên mâu thuẫn phát hiện được (4-5 câu, giải thích cả 2 phía của mâu thuẫn), xưng \"bạn\"",
  "suitableCareers": "3 nghề phù hợp, đánh số 1. 2. 3., mỗi nghề 2-3 câu giải thích rõ vì sao hợp với đúng tổ hợp DNA này, MỖI Ý CÁCH NHAU BẰNG \\n\\n",
  "idealEnvironment": "môi trường làm việc lý tưởng (4-5 câu, càng cụ thể càng tốt: quy mô đội nhóm, phong cách quản lý, nhịp độ)",
  "commonMistakes": "2-3 sai lầm dễ mắc phải, đánh số 1. 2. 3., mỗi sai lầm 2-3 câu kèm tình huống ví dụ cụ thể, MỖI Ý CÁCH NHAU BẰNG \\n\\n",
  "ninetyDayPlan": [
    {
      "stageLabel": "Giai đoạn 1: Ngày 1-30 - [tên chủ đề ngắn gọn]",
      "weeks": [
        { "weekLabel": "Tuần 1-2", "actions": ["hành động 1", "hành động 2", "hành động 3"] },
        { "weekLabel": "Tuần 3-4", "actions": ["hành động 1", "hành động 2", "hành động 3"] }
      ]
    },
    { "stageLabel": "Giai đoạn 2: Ngày 31-60 - [tên chủ đề ngắn gọn]", "weeks": [ ... ] },
    { "stageLabel": "Giai đoạn 3: Ngày 61-90 - [tên chủ đề ngắn gọn]", "weeks": [ ... ] }
  ]
}`;

  const requestConfig = {
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      maxOutputTokens: 8000,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Đoạn tóm tắt DNA, 4-5 câu, KHÔNG chứa JSON hay ký tự đặc biệt" },
          topStrengths: { type: Type.STRING, description: "3 điểm mạnh nhất, mỗi điểm 2-3 câu kèm ví dụ hành vi cụ thể, cách nhau bằng xuống dòng" },
          blindSpots: { type: Type.STRING, description: "Điểm mù dựa trên mâu thuẫn phát hiện được, 4-5 câu" },
          suitableCareers: { type: Type.STRING, description: "3 nghề phù hợp, mỗi nghề 2-3 câu giải thích rõ lý do" },
          idealEnvironment: { type: Type.STRING, description: "Môi trường làm việc lý tưởng, 4-5 câu cụ thể" },
          commonMistakes: { type: Type.STRING, description: "2-3 sai lầm dễ mắc phải, mỗi sai lầm 2-3 câu kèm ví dụ" },
          ninetyDayPlan: {
            type: Type.ARRAY,
            description: "3 giai đoạn phát triển 90 ngày",
            items: {
              type: Type.OBJECT,
              properties: {
                stageLabel: { type: Type.STRING, description: "VD: 'Giai đoạn 1: Ngày 1-30 - Nhận diện điểm mù'" },
                weeks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      weekLabel: { type: Type.STRING, description: "VD: 'Tuần 1-2'" },
                      actions: {
                        type: Type.ARRAY,
                        description: "Đúng 3 hành động cụ thể",
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["weekLabel", "actions"],
                  },
                },
              },
              required: ["stageLabel", "weeks"],
            },
          },
        },
        required: [
          "summary", "topStrengths", "blindSpots", "suitableCareers",
          "idealEnvironment", "commonMistakes", "ninetyDayPlan",
        ],
      },
    },
  };

  // Gemini đôi khi báo 503 "quá tải tạm thời" (lỗi từ phía Google, không phải lỗi code) —
  // tự động thử lại tối đa 3 lần, mỗi lần đợi lâu hơn một chút, trước khi thực sự báo lỗi.
  async function callWithRetry(maxAttempts = 3): Promise<any> {
    let lastError: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await client.models.generateContent(requestConfig);
      } catch (err: any) {
        lastError = err;
        const isOverloaded = err?.message?.includes("UNAVAILABLE") || err?.message?.includes("503");
        if (!isOverloaded || attempt === maxAttempts) throw err;
        const waitMs = attempt * 1500; // 1.5s, 3s, 4.5s
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
    throw lastError;
  }

  const response = await callWithRetry();

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
    // Lọc bỏ mọi số thập phân dạng "0.54", "(0.51)" còn sót lại — phòng trường
    // hợp AI không tuân thủ đúng 100% dù đã yêu cầu trong prompt.
    const stripRawScores = (text: string) =>
      text.replace(/\(?[-]?\d+\.\d{1,3}\)?/g, "").replace(/\s{2,}/g, " ").replace(/\s+([.,;:])/g, "$1").trim();

    const cleanPlan: NinetyDayStage[] = Array.isArray(parsed.ninetyDayPlan)
      ? parsed.ninetyDayPlan.map((stage) => ({
          stageLabel: stripRawScores(stage.stageLabel ?? ""),
          weeks: (stage.weeks ?? []).map((week) => ({
            weekLabel: stripRawScores(week.weekLabel ?? ""),
            actions: (week.actions ?? []).map((a) => stripRawScores(a)) as [string, string, string],
          })),
        }))
      : [];

    return {
      summary: stripRawScores(parsed.summary ?? ""),
      topStrengths: stripRawScores(parsed.topStrengths ?? ""),
      blindSpots: stripRawScores(parsed.blindSpots ?? ""),
      suitableCareers: stripRawScores(parsed.suitableCareers ?? ""),
      idealEnvironment: stripRawScores(parsed.idealEnvironment ?? ""),
      commonMistakes: stripRawScores(parsed.commonMistakes ?? ""),
      ninetyDayPlan: cleanPlan,
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
      ninetyDayPlan: [],
    };
  }
}
