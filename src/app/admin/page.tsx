"use client";

import { useState } from "react";

interface QueueItem {
  code: string;
  archetype_name: string;
  contact_channel: string;
  contact_value: string;
  delivered: boolean;
  created_at: string;
}

const SECTION_LABELS: Record<string, string> = {
  summary: "Tóm tắt DNA",
  topStrengths: "3 điểm mạnh nhất",
  blindSpots: "Điểm mù",
  suitableCareers: "Nghề phù hợp",
  idealEnvironment: "Môi trường lý tưởng",
  commonMistakes: "Sai lầm dễ mắc",
  ninetyDayPlan: "Kế hoạch 90 ngày",
};

function buildPlainText(detail: any): string {
  const report = detail.report || {};
  const lines = [`DNA CAREER — ${detail.archetype_name} (${detail.code})`, ""];
  for (const key of Object.keys(SECTION_LABELS)) {
    if (report[key]) {
      lines.push(`— ${SECTION_LABELS[key]} —`);
      lines.push(report[key]);
      lines.push("");
    }
  }
  return lines.join("\n");
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [searchCode, setSearchCode] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadQueue(key: string) {
    const res = await fetch("/api/admin/queue", { headers: { "x-admin-secret": key } });
    if (!res.ok) {
      setError("Sai admin secret.");
      return;
    }
    const data = await res.json();
    setQueue(data.queue);
    setAuthed(true);
    setError("");
  }

  async function lookup(code: string) {
    setDetail(null);
    setCopied(false);
    const res = await fetch(`/api/report/${code}`, { headers: { "x-admin-secret": secret } });
    if (!res.ok) {
      setError("Không tìm thấy mã hoặc sai quyền truy cập.");
      return;
    }
    setDetail(await res.json());
    setError("");
  }

  async function markDelivered(code: string) {
    await fetch(`/api/report/${code}`, { method: "PATCH", headers: { "x-admin-secret": secret } });
    loadQueue(secret);
    if (detail?.code === code) setDetail({ ...detail, delivered: true });
  }

  function copyAll() {
    if (!detail) return;
    navigator.clipboard?.writeText(buildPlainText(detail));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-display font-semibold text-lg mb-4">Admin — DNA Career</h1>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin secret"
          className="border border-line bg-white rounded-full px-4 py-3 mb-3 w-72"
        />
        <button
          onClick={() => loadQueue(secret)}
          className="bg-ink text-canvas font-medium px-6 py-3 rounded-full"
        >
          Đăng nhập
        </button>
        {error && <p className="text-rose text-sm mt-3">{error}</p>}
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <h1 className="font-display font-semibold text-xl mb-6">Admin — Hàng chờ gửi report ({queue.length})</h1>

      <div className="flex gap-2 mb-8">
        <input
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Nhập mã DNA-XXXXXX để tra cứu"
          className="flex-1 border border-line bg-white rounded-full px-4 py-2 text-sm"
        />
        <button
          onClick={() => lookup(searchCode)}
          className="bg-ink text-canvas px-5 py-2 rounded-full text-sm font-medium"
        >
          Tra cứu
        </button>
      </div>

      {error && <p className="text-rose text-sm mb-4">{error}</p>}

      {detail && (
        <div className="bg-white border border-line rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between mb-1">
            <p className="font-display font-semibold text-lg">
              {detail.archetype_name}
            </p>
            <button
              onClick={copyAll}
              className="font-mono text-xs bg-rose text-white px-4 py-2 rounded-full whitespace-nowrap"
            >
              {copied ? "Đã copy ✓" : "Copy toàn bộ"}
            </button>
          </div>
          <p className="font-mono text-xs text-ink/40 mb-1">{detail.code}</p>
          <p className="text-xs text-ink/50 mb-5">
            Liên hệ: {detail.contact_channel} · {detail.contact_value ?? "chưa có"}
          </p>

          <div className="space-y-4">
            {Object.entries(SECTION_LABELS).map(([key, label]) => {
              const content = detail.report?.[key];
              if (!content) return null;
              return (
                <div key={key} className="border-t border-line pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-wide text-ink/35 mb-1.5">{label}</p>
                  <p className="text-sm text-ink/80 whitespace-pre-line leading-relaxed">{content}</p>
                </div>
              );
            })}
          </div>

          {!detail.delivered ? (
            <button
              onClick={() => markDelivered(detail.code)}
              className="mt-6 bg-ink text-canvas px-5 py-2.5 rounded-full text-sm font-medium"
            >
              Đánh dấu đã gửi
            </button>
          ) : (
            <p className="mt-6 text-sage text-sm font-medium">✓ Đã gửi</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {queue.map((item) => (
          <div
            key={item.code}
            className="bg-white border border-line rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-sm">
                {item.code} — {item.archetype_name}
              </p>
              <p className="text-xs text-ink/50">
                {item.contact_channel}: {item.contact_value}
              </p>
            </div>
            <button
              onClick={() => lookup(item.code)}
              className="font-mono text-xs text-rose font-medium"
            >
              Xem chi tiết
            </button>
          </div>
        ))}
        {queue.length === 0 && <p className="text-sm text-ink/40">Không có report nào đang chờ gửi 🎉</p>}
      </div>
    </main>
  );
}
