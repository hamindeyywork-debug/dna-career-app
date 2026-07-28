"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/scoring/questions";

type Stage = "intro" | "question" | "loading";

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
  const progressPct = Math.round((index / QUESTIONS.length) * 100);

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
      setStage("loading");
      await submitAnswers(newAnswers);
    }
  }

  async function submitAnswers(finalAnswers: typeof answers) {
    let msgTimer = setInterval(() => {
      setLoadingMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 2000);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      clearInterval(msgTimer);
      if (!res.ok) {
        alert(data.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
        setStage("intro");
        setIndex(0);
        setAnswers([]);
        return;
      }
      router.push(`/result/${data.code}`);
    } catch (e) {
      clearInterval(msgTimer);
      alert("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
      setStage("intro");
    }
  }

  if (stage === "intro") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">⏱️</div>
        <h2 className="text-xl font-bold mb-4">Trước khi bắt đầu</h2>
        <ul className="text-ink/70 space-y-2 max-w-sm">
          <li>Không có đáp án đúng hay sai</li>
          <li>Trả lời theo bản năng, đừng suy nghĩ quá lâu</li>
          <li>Kết quả được cá nhân hóa hoàn toàn theo bạn</li>
        </ul>
        <button
          onClick={startTest}
          className="mt-8 bg-coral text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:opacity-90 transition"
        >
          Bắt đầu ngay
        </button>
      </main>
    );
  }

  if (stage === "loading") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blush to-coral animate-spin-slow mb-8" />
        <p className="text-ink/70">{LOADING_MESSAGES[loadingMsgIndex]}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-6 py-10">
      <div className="w-full max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex-1 h-1.5 bg-blush/40 rounded-full overflow-hidden">
            <div className="h-full bg-coral transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs text-ink/50 whitespace-nowrap">
            Câu {index + 1}/{QUESTIONS.length}
          </span>
        </div>

        <p className="text-lg font-medium mb-8 leading-relaxed">{question.situation}</p>

        <div className="space-y-3">
          {question.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => selectChoice(i as 0 | 1 | 2 | 3)}
              className="w-full text-left bg-white border border-blush/60 rounded-2xl px-5 py-4 hover:border-coral hover:bg-blush/10 transition"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
