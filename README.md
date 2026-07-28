# DNA Career — Web App

Next.js 14 + Supabase + Claude API. Đã build thành công và test chạy local (landing, test flow, admin) trong môi trường phát triển — chỉ còn 2 bước bạn cần tự làm vì cần tài khoản riêng: **tạo Supabase project** và **deploy lên Vercel**.

## 1. Cấu trúc dự án

```
src/
  app/
    page.tsx                 → Landing Page
    test/page.tsx             → Intro + 40 câu hỏi + loading
    result/[code]/page.tsx     → Result 30% + Locked Report + Follow Popup (server component)
    result/[code]/ResultView.tsx → phần tương tác (client component)
    admin/page.tsx             → Tra cứu + gửi report thủ công
    api/submit/route.ts        → Nhận 40 câu trả lời, chạy pipeline, lưu Supabase
    api/report/[code]/route.ts → Unlock (follow+nhắn), Admin xem/đánh dấu đã gửi
    api/admin/queue/route.ts   → Danh sách report đang chờ gửi
  lib/
    scoring/
      factors.ts        → 16 yếu tố CORE-16
      questions.ts       → 40 câu hỏi + trọng số
      archetypes.ts      → Thư viện 8 DNA Type (Layer 5a)
      layer1_2.ts        → Layer 1 (chấm câu) + Layer 2 (hành vi)
      layer3_4.ts        → Layer 3 (mâu thuẫn) + Layer 4 (độ tin cậy)
      layer5.ts          → Layer 5a (phân loại) + Layer 5b (gọi Claude API)
      pipeline.ts         → Chạy toàn bộ 5 layer
    supabase.ts          → Supabase client (server-side)
supabase/schema.sql      → Chạy 1 lần trong Supabase SQL Editor
```

## 2. Setup Supabase (5 phút)

1. Tạo project mới tại [supabase.com](https://supabase.com) (free tier đủ dùng ở giai đoạn đầu)
2. Vào **SQL Editor** → dán toàn bộ nội dung file `supabase/schema.sql` → Run
3. Vào **Project Settings > API** → copy `Project URL` và `service_role key` (không phải `anon key`)

## 3. Cấu hình biến môi trường

Copy `.env.example` thành `.env.local` và điền:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...          # từ bước 2
ANTHROPIC_API_KEY=sk-ant-...           # console.anthropic.com > API Keys
ADMIN_SECRET=chon-1-mat-khau-bat-ky    # để bảo vệ trang /admin
```

## 4. Chạy thử local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000` — landing page → `/test` để làm thử 40 câu → sẽ redirect sang `/result/DNA-XXXXXX`.

## 5. Deploy lên Vercel (miễn phí)

1. Đẩy project này lên một GitHub repo riêng của bạn
2. Vào [vercel.com](https://vercel.com) → New Project → chọn repo đó
3. Ở phần **Environment Variables**, dán đúng 4 biến ở bước 3
4. Deploy — Vercel sẽ cho bạn 1 link dạng `https://ten-du-an.vercel.app`, dùng link này trong bio TikTok

## 6. Vận hành hàng ngày (Admin)

- Vào `https://ten-du-an.vercel.app/admin`, nhập `ADMIN_SECRET`
- Danh sách hiện ra là các báo cáo đã unlock (follow + nhắn từ khóa) nhưng **chưa gửi**
- Bấm "Xem chi tiết" để lấy nội dung report (JSON có sẵn 7 mục: summary, topStrengths, blindSpots, suitableCareers, idealEnvironment, commonMistakes, ninetyDayPlan) → copy sang Zalo/Messenger gửi cho người dùng
- Bấm "Đánh dấu đã gửi" sau khi gửi xong

⚠️ **Đây chính là điểm nghẽn đã cảnh báo ở Chương 13.8 của tài liệu Product Design** — quy trình gửi tay chỉ nên dùng ở giai đoạn đầu (dưới ~20-30 report/ngày). Khi traffic tăng, cần tự động hóa bước này (ví dụ: tự động gửi qua Zalo OA API hoặc email) để tránh làm chậm trải nghiệm người dùng.

## 7. Các đơn giản hóa so với tài liệu thiết kế gốc (MVP)

Để có một bản chạy được ngay, một số phần trong tài liệu 33 trang đã được rút gọn:

- **Archetype library**: 8 DNA Type thay vì thư viện đầy đủ — dễ mở rộng thêm trong `src/lib/scoring/archetypes.ts`
- **Population percentile**: ước lượng dựa trên khoảng cách vector, chưa dùng phân bố dân số thật (cần đủ dữ liệu người dùng thật trước)
- **Layer 2 baseline thời gian phản hồi**: dùng hằng số giả định (`ASSUMED_MEAN_MS`, `ASSUMED_STD_MS` trong `layer1_2.ts`), nên thay bằng số liệu trung bình thực tế sau khi có vài trăm lượt làm test
- **AI Career Coach (Chương 10)** và **module DNA Love/Money/Growth/Leader (Chương 12)** chưa được code — đây là phần mở rộng giai đoạn 2, kiến trúc dữ liệu hiện tại (đặc biệt bảng `dna_results.vector`) đã được thiết kế để tái sử dụng cho các module này mà không cần đổi cấu trúc

## 8. Chi phí vận hành ước tính

- Supabase free tier: đủ dùng đến ~500MB dữ liệu / 50k requests tháng — miễn phí ở giai đoạn đầu
- Vercel free tier: đủ dùng cho traffic vừa phải
- Claude API: chỉ gọi 1 lần/người dùng ở Layer 5b (~2000 tokens output) — chi phí trên mỗi user rất thấp, đúng như thiết kế kiến trúc 5-layer đã nêu ở Chương 5
