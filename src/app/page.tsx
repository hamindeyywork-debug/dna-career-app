import Link from "next/link";

const HELIX_NODES = Array.from({ length: 16 });

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 md:px-10 pt-8 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.2em] text-ink/50 uppercase">
          DNA Insight™
        </span>
        <span className="font-mono text-xs text-ink/30">01 / Career</span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto">
        <p className="font-mono text-xs tracking-[0.25em] text-rose uppercase mb-6 animate-fade-up">
          DNA Career — module đầu tiên
        </p>

        <h1
          className="font-display text-[2.1rem] md:text-5xl font-semibold leading-[1.15] mb-6 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Bạn có đang chọn đúng
          <br />
          con đường sự nghiệp của mình?
        </h1>

        <p
          className="text-ink/65 leading-relaxed max-w-md mb-10 animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          Không phải bài test tính cách — mà là cách AI đọc bạn qua phản xạ
          thật, không phải qua câu trả lời bạn nghĩ là đúng.
        </p>

        {/* Signature motif: chuỗi gen 16 node, ứng với 16 yếu tố CORE-16 */}
        <div
          className="gene-thread w-full max-w-xs mb-10 animate-fade-up"
          style={{ animationDelay: "220ms" }}
          aria-hidden="true"
        >
          {HELIX_NODES.map((_, i) => (
            <div key={i} className="flex items-center flex-1 gap-1">
              <div
                className="gene-node active"
                style={{ animationDelay: `${i * 90}ms` }}
              />
              {i < HELIX_NODES.length - 1 && <div className="gene-link" />}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-1 gap-2.5 text-sm text-left w-full max-w-sm mb-10 animate-fade-up"
          style={{ animationDelay: "280ms" }}
        >
          <div className="flex items-start gap-3 bg-white/60 rounded-xl px-4 py-3 border border-line">
            <span className="font-mono text-rose text-xs pt-0.5">40</span>
            <span className="text-ink/75">tình huống thật, không phải câu hỏi tự khai</span>
          </div>
          <div className="flex items-start gap-3 bg-white/60 rounded-xl px-4 py-3 border border-line">
            <span className="font-mono text-rose text-xs pt-0.5">05</span>
            <span className="text-ink/75">lớp AI phân tích, phát hiện cả điểm mù bạn chưa nhận ra</span>
          </div>
          <div className="flex items-start gap-3 bg-white/60 rounded-xl px-4 py-3 border border-line">
            <span className="font-mono text-rose text-xs pt-0.5">22-32</span>
            <span className="text-ink/75">thiết kế riêng cho phụ nữ Việt Nam ở tuổi này</span>
          </div>
        </div>

        <Link
          href="/test"
          className="animate-fade-up bg-ink text-canvas font-medium px-9 py-4 rounded-full hover:bg-rose transition-colors duration-300"
          style={{ animationDelay: "340ms" }}
        >
          Khám phá DNA Career của bạn
        </Link>

        <p
          className="mt-4 font-mono text-xs text-ink/40 animate-fade-up"
          style={{ animationDelay: "380ms" }}
        >
          ~8 phút · không cần đăng ký
        </p>
      </section>

      <footer className="px-6 pb-8 text-center">
        <p className="font-mono text-[11px] text-ink/30">
          một module trong hệ sinh thái DNA Insight™
        </p>
      </footer>
    </main>
  );
}
