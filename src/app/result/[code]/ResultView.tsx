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
  { title: "Điểm mù của bạn", hint: "Điều này có thể đang âm thầm ảnh hưởng đến sự nghiệp của bạn" },
  { title: "Môi trường làm việc lý tưởng", hint: "Nơi bạn phát triển nhanh nhất, và nơi bạn nên tránh" },
  { title: "Những sai lầm bạn dễ mắc", hint: "3 điều phổ biến khiến người cùng DNA Type dễ vấp phải" },
  { title: "Kế hoạch phát triển 90 ngày", hint: "Từng bước cụ thể, chia theo 3 giai đoạn 30 ngày" },
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
    <main className="min-h-screen px-6 py-12 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Badge */}
        <div className="text-center mb-6">
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: props.badgeColor }}
          >
            DNA
          </div>
          <p className="text-xs uppercase tracking-widest text-ink/50">DNA Career của bạn</p>
          <h1 className="text-2xl font-bold mt-1">{props.archetypeName}</h1>
          <p className="text-ink/60 mt-2 text-sm">{props.shortDescription}</p>
          {props.populationPercentile ? (
            <p className="text-xs text-coral mt-2">
              Chỉ {props.populationPercentile}% người làm test có DNA giống bạn
            </p>
          ) : null}
        </div>

        {props.summary && (
          <p className="bg-white rounded-2xl p-5 text-ink/80 leading-relaxed mb-8 border border-blush/50">
            {props.summary}
          </p>
        )}

        {props.strengthsTeaser.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2 text-sm text-ink/60 uppercase tracking-wide">3 điểm mạnh nhất</h2>
            <div className="grid gap-2">
              {props.strengthsTeaser.map((s, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-3 border border-blush/50 text-sm">
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {props.careersTeaser.length > 0 && (
          <div className="mb-10">
            <h2 className="font-semibold mb-2 text-sm text-ink/60 uppercase tracking-wide">3 nghề phù hợp</h2>
            <div className="flex flex-wrap gap-2">
              {props.careersTeaser.map((c, i) => (
                <span key={i} className="bg-blush/30 rounded-full px-4 py-2 text-sm">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Locked / Unlocked report */}
        {!isUnlocked ? (
          <div className="border-2 border-dashed border-blush rounded-2xl p-5 mb-8">
            <p className="text-sm font-semibold mb-4">
              Bạn mới chỉ thấy 30% DNA Career của mình — báo cáo đầy đủ có 8 trang phân tích
            </p>
            <div className="space-y-3">
              {LOCKED_SECTIONS.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span>🔒</span>
                  <div>
                    <p className="font-medium text-sm">{s.title}</p>
                    <p className="text-xs text-ink/40 blur-[2px] select-none">{s.hint}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPopupOpen(true)}
              className="mt-5 w-full bg-coral text-white font-semibold px-6 py-4 rounded-full hover:opacity-90 transition"
            >
              Mở khóa báo cáo đầy đủ — Miễn phí
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold">Đã gửi yêu cầu thành công!</p>
            <p className="text-sm text-ink/60 mt-1">
              {props.delivered
                ? "Hamin đã gửi báo cáo đầy đủ cho bạn — kiểm tra Zalo/Messenger nhé."
                : "Hamin sẽ tự tay gửi báo cáo đầy đủ cho bạn trong thời gian sớm nhất."}
            </p>
            <p className="text-xs text-ink/40 mt-3">Mã kết quả của bạn: {props.code}</p>
          </div>
        )}

        {/* Share prompt - luôn hiện, tăng viral loop */}
        <div className="text-center">
          <p className="text-sm text-ink/60 mb-3">Thử thách bạn bè cùng khám phá DNA Career của họ?</p>
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
            className="border border-coral text-coral font-semibold px-6 py-3 rounded-full hover:bg-coral hover:text-white transition"
          >
            Chia sẻ kết quả
          </button>
        </div>
      </div>

      {/* Follow TikTok Popup */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <p className="text-xs text-ink/40 mb-4">Bước {step}/2</p>

            {step === 1 && (
              <>
                <h3 className="font-bold text-lg mb-2">Follow để mở khóa</h3>
                <p className="text-sm text-ink/60 mb-5">
                  Follow @{TIKTOK_HANDLE} trên TikTok — chỉ mất 10 giây.
                </p>
                <a
                  href={`https://www.tiktok.com/@${TIKTOK_HANDLE}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setFollowed(true)}
                  className="block text-center bg-ink text-white font-semibold px-6 py-3 rounded-full mb-3"
                >
                  Mở TikTok @{TIKTOK_HANDLE}
                </a>
                <button
                  disabled={!followed}
                  onClick={() => setStep(2)}
                  className="w-full bg-coral disabled:bg-blush disabled:text-ink/40 text-white font-semibold px-6 py-3 rounded-full transition"
                >
                  Đã follow, tiếp tục
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="font-bold text-lg mb-2">Gửi mã để nhận báo cáo</h3>
                <p className="text-sm text-ink/60 mb-4">
                  Nhắn nội dung sau qua Zalo hoặc Messenger — Hamin sẽ tự tay gửi báo cáo đầy đủ cho bạn.
                </p>
                <div className="bg-blush/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                  <code className="text-sm">{keywordMessage}</code>
                  <button onClick={copyKeyword} className="text-xs text-coral font-semibold">
                    Copy
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setContactChannel("zalo")}
                    className={`flex-1 py-2 rounded-full text-sm font-medium ${
                      contactChannel === "zalo" ? "bg-ink text-white" : "bg-blush/30"
                    }`}
                  >
                    Zalo
                  </button>
                  <button
                    onClick={() => setContactChannel("messenger")}
                    className={`flex-1 py-2 rounded-full text-sm font-medium ${
                      contactChannel === "messenger" ? "bg-ink text-white" : "bg-blush/30"
                    }`}
                  >
                    Messenger
                  </button>
                </div>

                <input
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={contactChannel === "zalo" ? "Số điện thoại Zalo" : "Username Messenger"}
                  className="w-full border border-blush rounded-full px-4 py-3 text-sm mb-4"
                />

                <button
                  onClick={confirmSend}
                  disabled={submitting || !contactValue.trim()}
                  className="w-full bg-coral disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-full"
                >
                  {submitting ? "Đang gửi..." : "Gửi mã để nhận báo cáo"}
                </button>
              </>
            )}

            <button
              onClick={() => setPopupOpen(false)}
              className="w-full text-center text-xs text-ink/40 mt-4"
            >
              Để sau
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
