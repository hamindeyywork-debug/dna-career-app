"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/scoring/questions";

type Stage = "intro" | "question" | "loading" | "error";

const LOADING_MESSAGES = [
  "Đang đọc 40 phản ứng của bạn...",
  "Đang phân tích hành vi...",
  "Đang đối chiếu tính nhất quán...",
  "Đang tính độ tin cậy...",
  "Đang tạo DNA Career của bạn...",
];

export default function TestPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; choiceIndex: 0 | 1 | 2 | 3; responseTimeMs: number }[]>([]);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const questionStartRef = useRef<number>(Date.now());

  const question = QUESTIONS[index];
  const answeredCount = index;

  function startTest() {
    setStage("question");
    questionStartRef.current = Date.now();
  }

  async function selectChoice(choiceIndex: 0 | 1 | 2 | 3) {
    const responseTimeMs = Date.now() - questionStartRef.current;
    const newAnswers = [...answers, { questionId: question.id, choiceIndex, responseTimeMs }];
    setAnswers(newAnswers);

    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
      questionStartRef.current = Date.now();
    } else {
      await submitAnswers(newAnswers);
    }
  }

  async function submitAnswers(finalAnswers: typeof answers) {
    setStage("loading");
    const msgTimer = setInterval(() => {
      setLoadingMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 2200);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      clearInterval(msgTimer);
      if (!res.ok) {
        // Không reset câu trả lời — giữ nguyên để người dùng thử lại mà không cần làm lại 40 câu
        setStage("error");
        return;
      }
      router.push(`/result/${data.code}`);
    } catch (e) {
      clearInterval(msgTimer);
      setStage("error");
    }
  }

  if (stage === "intro") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <span className="font-mono text-xs tracking-[0.25em] text-rose uppercase mb-6">
          Trước khi bắt đầu
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6 max-w-sm leading-snug">
          Không có đáp án đúng hay sai
        </h2>
        <p className="text-ink/65 max-w-sm text-sm mb-10 leading-relaxed">
          Cứ trả lời theo bản năng đầu tiên của bạn, đừng nghĩ quá lâu — kết
          quả sẽ tự nhiên đúng là của riêng bạn.
        </p>
        <button
          onClick={startTest}
          className="bg-ink text-canvas font-medium px-9 py-4 rounded-full hover:bg-rose transition-colors duration-300"
        >
          Bắt đầu ngay
        </button>
      </main>
    );
  }

  if (stage === "loading") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-line" />
          <div className="absolute inset-0 rounded-full border-2 border-t-rose border-r-transparent border-b-transparent border-l-transparent animate-helix" />
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-ink/40">
            DNA
          </div>
        </div>
        <p className="font-mono text-sm text-ink/60">{LOADING_MESSAGES[loadingMsgIndex]}</p>
      </main>
    );
  }

  if (stage === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-bold mb-3">Hệ thống đang hơi đông</h2>
        <p className="text-ink/60 max-w-sm mb-2">
          AI đang xử lý nhiều yêu cầu cùng lúc nên phản hồi chậm hơn bình thường.
        </p>
        <p className="text-ink/60 max-w-sm mb-8">
          Câu trả lời của bạn vẫn được giữ nguyên — không cần làm lại từ đầu.
        </p>
        <button
          onClick={() => submitAnswers(answers)}
          className="bg-rose text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:opacity-90 transition"
        >
          Thử lại ngay
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10">
      <div className="w-full max-w-lg mx-auto">
        {/* Progress: chuỗi gen — mỗi node ứng 1 câu, sáng dần khi trả lời */}
        <div className="flex items-center gap-3 mb-10">
          <div className="gene-thread flex-1">
            {QUESTIONS.map((_, i) => (
              <div key={i} className="flex-1">
                <div className={`gene-node ${i <= answeredCount ? "active" : ""}`} style={{ width: "100%", height: "3px", borderRadius: "2px" }} />
              </div>
            ))}
          </div>
          <span className="font-mono text-xs text-ink/40 whitespace-nowrap">
            {index + 1}/{QUESTIONS.length}
          </span>
        </div>

        <p className="font-display text-xl md:text-2xl font-medium mb-8 leading-relaxed animate-fade-up" key={question.id}>
          {question.situation}
        </p>

        <div className="space-y-3">
          {question.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => selectChoice(i as 0 | 1 | 2 | 3)}
              className="w-full text-left bg-white border border-line rounded-2xl px-5 py-4 hover:border-rose hover:bg-rose-soft/20 transition-colors duration-200"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
