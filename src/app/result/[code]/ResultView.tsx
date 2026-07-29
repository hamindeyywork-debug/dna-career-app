"use client";

import { useState } from "react";

interface Props {
  code: string;
  archetypeName: string;
  badgeColor: string;
  shortDescription: string;
  populationPercentile: number;
  summary: string;
  strengthsTeaser: string[];
  careersTeaser: string[];
  unlocked: boolean;
  delivered: boolean;
}

const LOCKED_SECTIONS = [
  { n: "04", title: "Điểm mù của bạn", hint: "Điều này có thể đang âm thầm ảnh hưởng đến sự nghiệp của bạn" },
  { n: "05", title: "Môi trường làm việc lý tưởng", hint: "Nơi bạn phát triển nhanh nhất, và nơi bạn nên tránh" },
  { n: "06", title: "Những sai lầm bạn dễ mắc", hint: "3 điều phổ biến khiến người cùng DNA Type dễ vấp phải" },
  { n: "07", title: "Kế hoạch phát triển 90 ngày", hint: "Từng bước cụ thể, chia theo 3 giai đoạn 30 ngày" },
];

const TIKTOK_HANDLE = "hamin139";

export default function ResultView(props: Props) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [followed, setFollowed] = useState(false);
  const [contactChannel, setContactChannel] = useState<"zalo" | "messenger">("zalo");
  const [contactValue, setContactValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(props.unlocked);

  const keywordMessage = `DNA ${props.code}`;

  async function confirmSend() {
    if (!contactValue.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/report/${props.code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactChannel, contactValue }),
      });
      if (res.ok) {
        setIsUnlocked(true);
        setPopupOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function copyKeyword() {
    navigator.clipboard?.writeText(keywordMessage);
  }

  return (
    <main className="min-h-screen px-6 py-14 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <p className="font-mono text-xs text-ink/40 text-center mb-3">{props.code}</p>

        {/* Badge — "gene marker" style, vòng quanh là chuỗi node màu riêng archetype */}
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <div className="relative w-28 h-28 mb-5">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i / 16) * 2 * Math.PI;
                const x1 = 50 + 42 * Math.cos(angle);
                const y1 = 50 + 42 * Math.sin(angle);
                return (
                  <circle key={i} cx={x1} cy={y1} r="2.2" fill={props.badgeColor} opacity={0.75} />
                );
              })}
            </svg>
            <div
              className="absolute inset-[14px] rounded-full flex items-center justify-center text-white font-display text-sm font-semibold"
              style={{ backgroundColor: props.badgeColor }}
            >
              DNA
            </div>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40 mb-2">
            DNA Career của bạn
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-center leading-snug">
            {props.archetypeName}
          </h1>
          <p className="text-ink/60 mt-3 text-sm text-center max-w-sm">{props.shortDescription}</p>
          {props.populationPercentile ? (
            <p className="font-mono text-xs text-rose mt-3">
              chỉ {props.populationPercentile}% người làm test có DNA giống bạn
            </p>
          ) : null}
        </div>

        {props.summary && (
          <div className="bg-white rounded-2xl p-6 border border-line mb-8 animate-fade-up">
            <p className="font-mono text-[11px] text-ink/35 uppercase tracking-[0.15em] mb-3">01 · Tóm tắt DNA</p>
            <p className="text-ink/80 leading-relaxed">{props.summary}</p>
          </div>
        )}

        {props.strengthsTeaser.length > 0 && (
          <div className="mb-6 animate-fade-up">
            <p className="font-mono text-[11px] text-ink/35 uppercase tracking-[0.15em] mb-3">02 · 3 điểm mạnh nhất</p>
            <div className="grid gap-2">
              {props.strengthsTeaser.map((s, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-3.5 border border-line text-sm text-ink/75 flex gap-3">
                  <span className="font-mono text-rose flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {props.careersTeaser.length > 0 && (
          <div className="mb-10 animate-fade-up">
            <p className="font-mono text-[11px] text-ink/35 uppercase tracking-[0.15em] mb-3">03 · Nghề phù hợp</p>
            <div className="flex flex-wrap gap-2">
              {props.careersTeaser.map((c, i) => (
                <span key={i} className="bg-sage-soft text-sage border border-sage/30 rounded-full px-4 py-2 text-sm">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Locked / Unlocked report */}
        {!isUnlocked ? (
          <div className="border border-line rounded-2xl p-6 mb-8 bg-white/40 animate-fade-up">
            <p className="text-sm font-medium mb-5">
              Bạn mới chỉ thấy <span className="font-mono text-rose">30%</span> DNA Career của mình — báo cáo đầy đủ có 8 trang phân tích
            </p>
            <div className="space-y-4">
              {LOCKED_SECTIONS.map((s) => (
                <div key={s.n} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-ink/30 pt-0.5">{s.n}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm flex items-center gap-2">
                      {s.title} <span className="text-xs">🔒</span>
                    </p>
                    <p className="text-xs text-ink/35 blur-[3px] select-none mt-0.5">{s.hint}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPopupOpen(true)}
              className="mt-6 w-full bg-ink text-canvas font-medium px-6 py-4 rounded-full hover:bg-rose transition-colors duration-300"
            >
              Mở khóa báo cáo đầy đủ — Miễn phí
            </button>
          </div>
        ) : (
          <div className="border border-sage/30 bg-sage-soft/40 rounded-2xl p-6 mb-8 text-center animate-fade-up">
            <div className="text-3xl mb-2">✓</div>
            <p className="font-medium">Đã gửi yêu cầu thành công!</p>
            <p className="text-sm text-ink/60 mt-1">
              {props.delivered
                ? "Hamin đã gửi báo cáo đầy đủ cho bạn — kiểm tra Zalo/Messenger nhé."
                : "Hamin sẽ tự tay gửi báo cáo đầy đủ cho bạn trong thời gian sớm nhất."}
            </p>
          </div>
        )}

        <div className="text-center animate-fade-up">
          <p className="text-sm text-ink/55 mb-3">Thử thách bạn bè cùng khám phá DNA Career của họ?</p>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "DNA Career của tôi",
                  text: `Tôi vừa khám phá ra tôi là "${props.archetypeName}" — bạn thì sao?`,
                  url: typeof window !== "undefined" ? window.location.origin : "",
                });
              } else {
                copyKeyword();
              }
            }}
            className="border border-ink/20 text-ink font-medium px-6 py-3 rounded-full hover:border-rose hover:text-rose transition-colors duration-300"
          >
            Chia sẻ kết quả
          </button>
        </div>
      </div>

      {/* Follow TikTok Popup */}
      {popupOpen && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center px-6 z-50">
          <div className="bg-canvas rounded-3xl p-7 max-w-sm w-full border border-line">
            <p className="font-mono text-xs text-ink/40 mb-5">Bước {step}/2</p>

            {step === 1 && (
              <>
                <h3 className="font-display font-semibold text-xl mb-2">Follow để mở khóa</h3>
                <p className="text-sm text-ink/60 mb-6">
                  Follow @{TIKTOK_HANDLE} trên TikTok — chỉ mất 10 giây.
                </p>
                <a
                  href={`https://www.tiktok.com/@${TIKTOK_HANDLE}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setFollowed(true)}
                  className="block text-center bg-ink text-canvas font-medium px-6 py-3.5 rounded-full mb-3"
                >
                  Mở TikTok @{TIKTOK_HANDLE}
                </a>
                <button
                  disabled={!followed}
                  onClick={() => setStep(2)}
                  className="w-full bg-rose disabled:bg-line disabled:text-ink/30 text-white font-medium px-6 py-3.5 rounded-full transition-colors"
                >
                  Đã follow, tiếp tục
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="font-display font-semibold text-xl mb-2">Gửi mã để nhận báo cáo</h3>
                <p className="text-sm text-ink/60 mb-4">
                  Nhắn nội dung sau qua Zalo hoặc Messenger — Hamin sẽ tự tay gửi báo cáo đầy đủ cho bạn.
                </p>
                <div className="bg-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between border border-line">
                  <code className="font-mono text-sm">{keywordMessage}</code>
                  <button onClick={copyKeyword} className="font-mono text-xs text-rose font-medium">
                    Copy
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setContactChannel("zalo")}
                    className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      contactChannel === "zalo" ? "bg-ink text-canvas" : "bg-white border border-line"
                    }`}
                  >
                    Zalo
                  </button>
                  <button
                    onClick={() => setContactChannel("messenger")}
                    className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
                      contactChannel === "messenger" ? "bg-ink text-canvas" : "bg-white border border-line"
                    }`}
                  >
                    Messenger
                  </button>
                </div>

                <input
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={contactChannel === "zalo" ? "Số điện thoại Zalo" : "Username Messenger"}
                  className="w-full border border-line bg-white rounded-full px-4 py-3 text-sm mb-4"
                />

                <button
                  onClick={confirmSend}
                  disabled={submitting || !contactValue.trim()}
                  className="w-full bg-rose disabled:opacity-50 text-white font-medium px-6 py-3.5 rounded-full"
                >
                  {submitting ? "Đang gửi..." : "Gửi mã để nhận báo cáo"}
                </button>
              </>
            )}

            <button
              onClick={() => setPopupOpen(false)}
              className="w-full text-center font-mono text-xs text-ink/35 mt-5"
            >
              Để sau
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
