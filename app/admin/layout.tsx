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
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100 antialiased">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-zinc-800 bg-[#121214] p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 text-amber-500 font-black tracking-wider uppercase text-sm">
            <ShieldAlert className="w-5 h-5" />
            Padelin Admin
          </div>
          
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
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
        <Link 
          href="http://localhost:3000/" 
          className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase text-zinc-500 hover:text-red-400 rounded-xl transition-all hover:bg-red-500/5"
        >
          <LogOut className="w-4 h-4" />
          Keluar Admin
        </Link>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}