"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarRange, ShieldAlert, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Master Schedule", href: "/admin/schedule", icon: CalendarRange },
  ];

  return (
    // ⚡ FIX 1: flex-col di HP (atas-bawah), md:flex-row di desktop (kiri-kanan)
    <div className="flex flex-col md:flex-row min-h-screen bg-[#09090b] text-zinc-100 antialiased">
      
      {/* SIDEBAR / TOPBAR */}
      {/* ⚡ FIX 2: Lebar penuh 'w-full' di HP, baru mengunci ke 'md:w-64' di layar desktop */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-[#121214] p-5 flex flex-col justify-between shrink-0 gap-4">
        
        {/* Bagian Logo dan Menu Navigasi */}
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex items-center gap-2 px-2 text-amber-500 font-black tracking-wider uppercase text-sm">
            <ShieldAlert className="w-5 h-5" />
            Padelin Admin
          </div>
          
          {/* ⚡ FIX 3: Navigasi horizontal 'flex-row' di HP agar muat kesamping, kembali vertikal di desktop */}
          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                    isActive
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM ACTION */}
        {/* ⚡ FIX 4: Mengubah localhost:3000 menjadi link relatif '/' agar tidak rusak saat online di Vercel */}
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-2.5 md:py-3 text-[10px] md:text-xs font-bold uppercase text-zinc-500 hover:text-red-400 rounded-xl transition-all hover:bg-red-500/5 self-start md:self-stretch"
        >
          <LogOut className="w-4 h-4" />
          Keluar Admin
        </Link>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}