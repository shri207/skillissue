import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillPulse | University Talent Intelligence Platform",
  description:
    "Multi-agent university talent intelligence platform powered by custom-trained offline NLP models on NVIDIA GTX 1650.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">SkillPulse</span>
              <span>•</span>
              <span>Multi-College University Talent Intelligence</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>DistilBERT NER</span>
              <span>•</span>
              <span>MiniLM Mapper</span>
              <span>•</span>
              <span>Dual-Head QueryParser</span>
              <span>•</span>
              <span>GTX 1650</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
