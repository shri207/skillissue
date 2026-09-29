"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Building2, Search, CheckCircle2 } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Student Portal", href: "/student", icon: GraduationCap },
    { name: "Principal Console", href: "/principal", icon: Building2 },
    { name: "Talent Directory", href: "/search", icon: Search },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs tracking-tighter">
            LMS
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-zinc-900">
              College Portal
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="hidden sm:inline">System Active</span>
        </div>
      </div>
    </header>
  );
}
