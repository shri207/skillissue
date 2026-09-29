import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "College LMS | Competency & Verification Portal",
  description: "Simple, minimalist university LMS portal for student skill submissions and principal approvals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans antialiased selection:bg-black selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
        <footer className="border-t border-zinc-200 bg-white py-6 text-xs text-zinc-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-zinc-800">College LMS</span> — Student Competency & Institutional Verification
            </div>
            <div className="text-zinc-400">
              CEG Anna University & PSG Tech Portal
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
