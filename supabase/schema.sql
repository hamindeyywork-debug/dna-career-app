-- DNA Career — Supabase schema
-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor > New query > Run

create extension if not exists "pgcrypto";

create table if not exists dna_results (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,              -- mã kết quả ngắn, hiển thị cho người dùng (vd. DNA-7F2K)
  archetype_id text not null,
  archetype_name text not null,
  vector jsonb not null,                  -- vector 16 trục đã chuẩn hóa
  population_percentile int,
  overall_confidence numeric,
  reliability_tier text,
  contradictions_count int default 0,
  raw_answers jsonb not null,             -- lưu toàn bộ 40 câu trả lời thô (Answer)
  report jsonb,                           -- 7 section report sinh từ Layer 5b
  unlocked boolean default false,         -- người dùng đã bấm mở khóa / follow xong chưa
  delivered boolean default false,        -- admin đã gửi report qua Zalo/Messenger chưa
  tiktok_followed boolean default false,
  contact_channel text,                   -- "zalo" | "messenger" | "tiktok_dm"
  contact_value text,                     -- số điện thoại / username người dùng cung cấp
  referral_source text,
  referred_by_code text,                  -- nếu đến từ cơ chế thách đấu (tag bạn bè)
  created_at timestamptz default now(),
  delivered_at timestamptz
);

create index if not exists idx_dna_results_code on dna_results(code);
create index if not exists idx_dna_results_created_at on dna_results(created_at);

create table if not exists events_log (
  id uuid primary key default gen_random_uuid(),
  code text,                              -- liên kết tới dna_results.code (có thể null trước khi có kết quả)
  event_type text not null,               -- start_test/complete_test/view_30/click_unlock/follow_confirmed/keyword_sent/report_delivered/share_action
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_events_log_code on events_log(code);
create index if not exists idx_events_log_event_type on events_log(event_type);

-- Row Level Security: chỉ cho phép service role (server) truy cập, chặn truy cập trực tiếp từ client
alter table dna_results enable row level security;
alter table events_log enable row level security;
-- Không tạo policy nào cho anon/authenticated => mặc định chặn hết, chỉ service_role (dùng trong API routes) mới đọc/ghi được.
