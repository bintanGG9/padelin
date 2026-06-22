"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DollarSign, CalendarCheck, Percent, Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, totalToday: 0, totalUpcoming: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const todayStr = format(new Date(), "yyyy-MM-dd");
  
      // ====================================================================
      // PERBAIKAN: Gunakan .gte("booking_date", todayStr) agar data 
      // hari kemarin otomatis terfilter & terhapus dari query aktivitas terbaru
      // ====================================================================
      const { data: bookings } = await supabase
        .from("bookings")
        .select("total_price, booking_date, user_name, court_name, booking_time")
        .gte("booking_date", todayStr); // ⚡ Hanya ambil data hari ini dan masa depan
  
      if (bookings) {
        let revenueToday = 0;
        let countToday = 0;
        let countUpcoming = 0;
  
        bookings.forEach((b) => {
          if (b.booking_date === todayStr) {
            revenueToday += b.total_price || 0;
            countToday++;
          } else if (b.booking_date > todayStr) {
            countUpcoming++;
          }
        });
  
        setStats({ revenue: revenueToday, totalToday: countToday, totalUpcoming: countUpcoming });
        
        // Ambil bokingan hari ini & masa depan, lalu urutkan yang paling baru masuk ke atas
        // Karena kita pakai .gte(), otomatis jadwal hari kemarin TIDAK AKAN PERNAH muncul di sini
        setRecentBookings(bookings.slice(-5).reverse());
      }
      setLoading(false);
    };
  
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Memuat data panel...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Dashboard Overview</h1>
        <p className="text-xs text-zinc-500 mt-1">Pantau performa operasional lapangan Padel Anda hari ini.</p>
      </div>

      {/* CARDS STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border border-zinc-800 bg-[#121214] p-6 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pendapatan Hari Ini</p>
            <h3 className="text-2xl font-black text-amber-500 tabular-nums">Rp {stats.revenue.toLocaleString("id-ID")}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/10">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="border border-zinc-800 bg-[#121214] p-6 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Booking Hari Ini</p>
            <h3 className="text-2xl font-black text-white tabular-nums">{stats.totalToday} Jadwal</h3>
          </div>
          <div className="p-3 bg-green-500/10 text-green-400 rounded-2xl border border-green-500/10">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* AKTIVITAS TERBARU */}
      <Card className="border border-zinc-800 bg-[#121214] p-6 shadow-xl rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Users className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Aktivitas Booking Terbaru</h3>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {recentBookings.length === 0 ? (
            <p className="text-xs text-zinc-600 py-4">Belum ada aktivitas transaksi bokingan.</p>
          ) : (
            recentBookings.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <p className="font-extrabold text-zinc-200">{b.user_name}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{b.court_name} • Jam {b.booking_time}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-zinc-400 block">{format(new Date(b.booking_date), "dd MMM yyyy", { locale: id })}</span>
                  <span className="text-[11px] text-amber-500 font-black mt-0.5 block">Rp {b.total_price?.toLocaleString("id-ID")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}