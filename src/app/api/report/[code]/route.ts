import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

// GET — dùng cho trang Admin để tra cứu report đầy đủ (cần header x-admin-secret)
export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("dna_results").select("*").eq("code", params.code).single();

  if (error || !data) {
    return NextResponse.json({ error: "Không tìm thấy mã kết quả." }, { status: 404 });
  }
  return NextResponse.json(data);
}

// POST — client gọi sau khi hoàn thành bước Follow + nhắn từ khóa
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const body = await req.json();
  const { contactChannel, contactValue } = body as { contactChannel: string; contactValue: string };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("dna_results")
    .update({ unlocked: true, tiktok_followed: true, contact_channel: contactChannel, contact_value: contactValue })
    .eq("code", params.code);

  if (error) {
    return NextResponse.json({ error: "Không thể cập nhật trạng thái." }, { status: 500 });
  }

  await supabase
    .from("events_log")
    .insert([
      { code: params.code, event_type: "follow_confirmed" },
      { code: params.code, event_type: "keyword_sent", metadata: { contactChannel, contactValue } },
    ]);

  return NextResponse.json({ ok: true });
}

// PATCH — admin đánh dấu đã gửi report thủ công qua Zalo/Messenger
export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("dna_results")
    .update({ delivered: true, delivered_at: new Date().toISOString() })
    .eq("code", params.code);

  if (error) {
    return NextResponse.json({ error: "Không thể cập nhật." }, { status: 500 });
  }

  await supabase.from("events_log").insert({ code: params.code, event_type: "report_delivered" });
  return NextResponse.json({ ok: true });
}
