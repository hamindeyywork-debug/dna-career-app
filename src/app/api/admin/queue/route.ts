import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("dna_results")
    .select("code, archetype_name, contact_channel, contact_value, unlocked, delivered, created_at")
    .eq("unlocked", true)
    .eq("delivered", false)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Không thể tải danh sách." }, { status: 500 });
  }
  return NextResponse.json({ queue: data });
}
