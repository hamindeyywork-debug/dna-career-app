import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DNA Career | DNA Insight™",
  description: "Khám phá DNA Career của bạn — AI phân tích hành vi, không phải bài test tính cách.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
