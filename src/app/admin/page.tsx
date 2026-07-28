"use client";

import { useState, useEffect } from "react";

interface QueueItem {
  code: string;
  archetype_name: string;
  contact_channel: string;
  contact_value: string;
  delivered: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [searchCode, setSearchCode] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [error, setError] = useState("");

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

  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="font-bold text-lg mb-4">Admin — DNA Career</h1>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin secret"
          className="border border-blush rounded-full px-4 py-3 mb-3 w-72"
        />
        <button
          onClick={() => loadQueue(secret)}
          className="bg-coral text-white font-semibold px-6 py-3 rounded-full"
        >
          Đăng nhập
        </button>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <h1 className="font-bold text-xl mb-6">Admin — Hàng chờ gửi report ({queue.length})</h1>

      <div className="flex gap-2 mb-8">
        <input
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Nhập mã DNA-XXXXXX để tra cứu"
          className="flex-1 border border-blush rounded-full px-4 py-2 text-sm"
        />
        <button
          onClick={() => lookup(searchCode)}
          className="bg-ink text-white px-5 py-2 rounded-full text-sm font-medium"
        >
          Tra cứu
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {detail && (
        <div className="bg-white border border-blush/50 rounded-2xl p-5 mb-8">
          <p className="font-semibold mb-1">
            {detail.code} — {detail.archetype_name}
          </p>
          <p className="text-xs text-ink/50 mb-3">
            Liên hệ: {detail.contact_channel} / {detail.contact_value ?? "chưa có"}
          </p>
          <pre className="text-xs bg-blush/10 rounded-xl p-4 whitespace-pre-wrap max-h-96 overflow-auto">
            {JSON.stringify(detail.report, null, 2)}
          </pre>
          {!detail.delivered ? (
            <button
              onClick={() => markDelivered(detail.code)}
              className="mt-4 bg-coral text-white px-5 py-2 rounded-full text-sm font-medium"
            >
              Đánh dấu đã gửi
            </button>
          ) : (
            <p className="mt-4 text-green-600 text-sm font-medium">✓ Đã gửi</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {queue.map((item) => (
          <div
            key={item.code}
            className="bg-white border border-blush/50 rounded-xl px-4 py-3 flex items-center justify-between"
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
              className="text-xs text-coral font-semibold"
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
