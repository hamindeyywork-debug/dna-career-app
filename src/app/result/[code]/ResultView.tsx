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
  { n: "07", title: "Kế hoạch 90 ngày phát triển sự nghiệp", hint: "Từng bước cụ thể theo tuần, chia theo 3 giai đoạn 30 ngày" },
];

const TIKTOK_HANDLE = "hamin139";
// Chỉ dùng để tạo link mở đúng kênh — không hiển thị dạng chữ ra giao diện
const ZALO_PHONE = "0793223663";
const FACEBOOK_ID = "61588946940789";

const ZALO_LINK = `https://zalo.me/${ZALO_PHONE}`;
const MESSENGER_LINK = `https://m.me/${FACEBOOK_ID}`;
const TIKTOK_LINK = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

// Copy có fallback cho các trình duyệt trong app (Zalo/TikTok in-app browser)
// hay chặn navigator.clipboard
function copyText(text: string): boolean {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // rơi xuống fallback bên dưới
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

export default function ResultView(props: Props) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [contactChannel, setContactChannel] = useState<"zalo" | "messenger" | "tiktok">("zalo");
  const [contactValue, setContactValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(props.unlocked);
  const [copied, setCopied] = useState(false);

  // Mã đã có sẵn tiền tố "DNA-" rồi (vd. DNA-ESKYBI) — không thêm "DNA " nữa để tránh trùng chữ
  const keywordMessage = props.code;

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

  function handleCopy() {
    const ok = copyText(keywordMessage);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            <div className="grid gap-2">
              {props.careersTeaser.map((c, i) => (
                <div key={i} className="bg-sage-soft/60 text-ink/80 border border-sage/30 rounded-xl px-4 py-3.5 text-sm leading-relaxed">
                  {c}
                </div>
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
                copyText(keywordMessage);
              }
            }}
            className="border border-ink/20 text-ink font-medium px-6 py-3 rounded-full hover:border-rose hover:text-rose transition-colors duration-300"
          >
            Chia sẻ kết quả
          </button>
        </div>
      </div>

      {/* Popup gộp 1 màn hình — không bắt người dùng quay đi quay lại nhiều bước */}
      {popupOpen && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center px-6 z-50 overflow-y-auto py-10">
          <div className="bg-canvas rounded-3xl p-7 max-w-sm w-full border border-line my-auto">
            <h3 className="font-display font-semibold text-xl mb-5">Mở khóa báo cáo đầy đủ</h3>

            {/* Việc 1: Follow */}
            <div className="mb-5">
              <p className="font-mono text-[11px] text-ink/35 uppercase tracking-wide mb-2">Việc 1 · Follow TikTok</p>
              <a
                href={TIKTOK_LINK}
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-ink text-canvas font-medium px-6 py-3.5 rounded-full"
              >
                Follow @{TIKTOK_HANDLE}
              </a>
            </div>

            {/* Việc 2: Copy mã + gửi qua kênh bất kỳ */}
            <div className="mb-5">
              <p className="font-mono text-[11px] text-ink/35 uppercase tracking-wide mb-2">Việc 2 · Gửi mã cho Hamin</p>

              <button
                onClick={handleCopy}
                className="w-full bg-white rounded-xl px-4 py-3 mb-3 flex items-center justify-between border border-line active:border-rose"
              >
                <code className="font-mono text-sm">{keywordMessage}</code>
                <span className="font-mono text-xs text-rose font-medium whitespace-nowrap ml-2">
                  {copied ? "Đã copy ✓" : "Bấm để copy"}
                </span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <a
                  href={ZALO_LINK}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setContactChannel("zalo")}
                  className="flex items-center justify-center py-3 rounded-xl border border-line bg-white hover:border-rose transition-colors text-xs font-medium"
                >
                  Zalo
                </a>
                <a
                  href={MESSENGER_LINK}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setContactChannel("messenger")}
                  className="flex items-center justify-center py-3 rounded-xl border border-line bg-white hover:border-rose transition-colors text-xs font-medium"
                >
                  Messenger
                </a>
                <a
                  href={TIKTOK_LINK}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setContactChannel("tiktok")}
                  className="flex items-center justify-center py-3 rounded-xl border border-line bg-white hover:border-rose transition-colors text-xs font-medium"
                >
                  TikTok
                </a>
              </div>
            </div>

            {/* Việc 3: nhập liên hệ + xác nhận — luôn hiện sẵn, không cần bấm "tiếp tục" trước */}
            <div>
              <p className="font-mono text-[11px] text-ink/35 uppercase tracking-wide mb-2">
                Việc 3 · Cho Hamin biết liên hệ lại qua đâu
              </p>
              <input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  contactChannel === "zalo"
                    ? "Số điện thoại Zalo của bạn"
                    : contactChannel === "messenger"
                    ? "Tên hiển thị Messenger của bạn"
                    : "Username TikTok của bạn"
                }
                className="w-full border border-line bg-white rounded-full px-4 py-3 text-sm mb-4"
              />

              <button
                onClick={confirmSend}
                disabled={submitting || !contactValue.trim()}
                className="w-full bg-rose disabled:opacity-50 text-white font-medium px-6 py-3.5 rounded-full"
              >
                {submitting ? "Đang gửi..." : "Xác nhận đã gửi mã"}
              </button>
            </div>

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
