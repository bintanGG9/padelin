"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, LogOut, Menu, X, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "OVERVIEW", path: "/admin", icon: LayoutDashboard },
    { name: "MASTER SCHEDULE", path: "/admin/schedule", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 antialiased flex flex-col md:flex-row">
      
      {/* ⚡ 1. HEADER TOP BAR (HANYA MUNCUL DI HP) */}
      <header className="md:hidden flex items-center justify-between h-16 px-4 bg-[#121214] border-b border-zinc-800 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span className="font-black text-sm tracking-wider text-white">PADELIN ADMIN</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-800/40 rounded-xl border border-zinc-700/50 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ⚡ 2. BACKDROP OVERLAY (HANYA DI HP SAAT MENU TERBUKA) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* ⚡ 3. SIDEBAR NAVIGATION (DRAWER DI HP, BAR KIRI DI LAPTOP) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#121214] border-r border-zinc-800 p-6 flex flex-col justify-between z-50
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:h-screen md:top-0 md:w-64 md:shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="space-y-8">
          {/* Logo Brand (Muncul di Laptop) */}
          <div className="hidden md:flex items-center gap-2.5 pb-4 border-b border-zinc-800/60">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span className="font-black tracking-wider text-white text-base">PADELIN ADMIN</span>
          </div>

          {/* List Menu Navigasi */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black tracking-wider transition-all duration-200 group
                    ${isActive 
                      ? "bg-amber-500 text-zinc-950 shadow-[0_4px_20px_rgba(245,158,11,0.25)]" 
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-800"
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-zinc-950" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tombol Keluar */}
        <button className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-xs font-bold tracking-wider text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all-200">
          <LogOut className="w-4 h-4" />
          KELUAR ADMIN
        </button>
      </aside>

      {/* ⚡ 4. KONTEN UTAMA (OTOMATIS BERADA DI KANAN NAV BAR PADA LAPTOP) */}
      <div className="flex-1 min-w-0 w-full min-h-screen flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full w-full mx-auto box-border overflow-x-hidden">
          {children}
        </main>
      </div>

    </div>
  );
}