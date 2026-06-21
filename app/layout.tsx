import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "元気やせ",
  description: "シニア向けダイエットアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}
