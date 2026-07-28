import { createClient } from "@supabase/supabase-js";

// Dùng ở server (API routes) — cần SUPABASE_SERVICE_ROLE_KEY (bí mật, không lộ ra client)
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường.");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
