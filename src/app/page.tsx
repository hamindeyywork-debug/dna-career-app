import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs tracking-widest uppercase text-coral font-semibold mb-6">DNA Insight™</p>

      <h1 className="text-3xl md:text-4xl font-bold max-w-xl leading-snug">
        Bạn có đang chọn đúng con đường sự nghiệp của mình?
      </h1>

      <p className="mt-4 max-w-md text-ink/70">
        Không phải bài test tính cách — là bản đồ DNA sự nghiệp được AI giải mã từ cách bạn phản ứng với tình huống thật.
      </p>

      <div className="mt-8 w-40 h-40 rounded-full bg-gradient-to-br from-blush to-coral animate-spin-slow opacity-70" />

      <ul className="mt-8 space-y-2 text-sm text-ink/80">
        <li>✓ 40 tình huống thật, không phải câu hỏi tự khai</li>
        <li>✓ AI phân tích đa lớp, phát hiện cả điểm mù bạn chưa nhận ra</li>
        <li>✓ Thiết kế riêng cho phụ nữ Việt Nam 22–32 tuổi</li>
      </ul>

      <Link
        href="/test"
        className="mt-10 bg-coral text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:opacity-90 transition"
      >
        Khám phá DNA Career của bạn
      </Link>

      <p className="mt-4 text-xs text-ink/50">~8 phút · Không cần đăng ký</p>
    </main>
  );
}
