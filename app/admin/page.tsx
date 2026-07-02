"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DollarSign, CalendarCheck, TrendingUp, CalendarDays, Phone } from "lucide-react";
import { format, subDays, addDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminOverview() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  
  // ⚡ STATE BARU UNTUK REAL-TIME TRACKING JADWAL
  const [todayCount, setTodayCount] = useState(0);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [tomorrowCount, setTomorrowCount] = useState(0);

  const [chartData, setChartData] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);

  // Menggunakan manipulasi date-fns agar aman dan konsisten dengan format Supabase
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  
  const currentMonthStr = format(new Date(), "yyyy-MM");

  useEffect(() => {
    async function getAnalyticsAndSchedule() {
      const { data: allData } = await supabase.from("bookings").select("total_price, booking_date");
      
      if (allData) {
        const revenuePerMonth = Array(12).fill(0);
        let currentMonthRevenue = 0;
        
        // Inisialisasi hitungan lokal
        let todayAccumulator = 0;
        let yesterdayAccumulator = 0;
        let tomorrowAccumulator = 0;

        allData.forEach((item) => {
          if (item.booking_date) {
            // ⚡ FILTERING JADWAL BERDASARKAN HARI SECARA LOKAL
            if (item.booking_date === todayStr) todayAccumulator++;
            if (item.booking_date === yesterdayStr) yesterdayAccumulator++;
            if (item.booking_date === tomorrowStr) tomorrowAccumulator++;

            if (item.total_price) {
              const priceNumber = Number(item.total_price) || 0;
              const dateObj = new Date(item.booking_date);
              const monthIndex = dateObj.getMonth();
              
              revenuePerMonth[monthIndex] += priceNumber;

              if (item.booking_date.startsWith(currentMonthStr)) {
                currentMonthRevenue += priceNumber;
              }
            }
          }
        });

        // Simpan hasil hitungan ke state masing-masing
        setTodayCount(todayAccumulator);
        setYesterdayCount(yesterdayAccumulator);
        setTomorrowCount(tomorrowAccumulator);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const formattedChartData = monthNames.map((name, index) => ({
          name,
          "Pendapatan": revenuePerMonth[index]
        }));

        setChartData(formattedChartData);
        setMonthlyRevenue(currentMonthRevenue);
      }

      const { data: dailyData } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_date", todayStr)
        .order("booking_time", { ascending: true });
      
      if (dailyData) {
        setTodayBookings(dailyData);
      }
    }
    getAnalyticsAndSchedule();
  }, [todayStr, yesterdayStr, tomorrowStr, currentMonthStr]);

  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return "Rp 0";
    if (tickItem >= 1000000) return `Rp ${(tickItem / 1000000).toFixed(1)}M`;
    return `Rp ${(tickItem / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden p-1 sm:p-2">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-100">DASHBOARD OVERVIEW</h1>
        <p className="text-sm text-zinc-400">Analisis tren keuangan bulanan dan monitoring operasional harian.</p>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CARD PENDAPATAN */}
        <div className="bg-[#121214] p-5 rounded-2xl border border-zinc-800 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pendapatan Bulan Ini</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400">Rp {monthlyRevenue.toLocaleString("id-ID")}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><DollarSign className="w-5 h-5" /></div>
        </div>

        {/* CARD TOTAL TRANSAKSI + FITUR KEMARIN & BESOK */}
        <div className="bg-[#121214] p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Transaksi (Hari Ini)</p>
              <p className="text-xl sm:text-2xl font-black text-zinc-100">{todayCount} Jadwal</p>
            </div>
            <div className="p-3 bg-zinc-500/10 rounded-xl text-zinc-400"><CalendarCheck className="w-5 h-5" /></div>
          </div>

          {/* ⚡ CONTAINER FOOTER BARU UNTUK COMPONENT KEMARIN DAN BESOK */}
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex justify-between gap-4 text-[11px]">
            <div className="flex flex-col">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Kemarin</span>
              <span className="text-zinc-400 font-black mt-0.5">{yesterdayCount} Jadwal</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Besok</span>
              <span className="text-emerald-500 font-black mt-0.5">{tomorrowCount} Jadwal</span>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM LINE CHART RECHARTS */}
      <div className="bg-[#121214] p-4 sm:p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Tren Pendapatan Bulanan (2026)</h3>
        </div>

        <div className="w-full h-72 text-zinc-400 text-xs mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#71717a" 
                tickLine={false} 
                axisLine={false}
                dy={10}
                style={{ fontSize: "11px", fontWeight: "bold" }}
              />
              <YAxis 
                stroke="#71717a" 
                tickLine={false} 
                axisLine={false} 
                domain={[0, "auto"]}
                tickFormatter={formatYAxis}
                style={{ fontSize: "10px", fontWeight: "medium" }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px" }}
                itemStyle={{ color: "#10b981", fontWeight: "bold", fontSize: "12px" }}
                labelStyle={{ color: "#a1a1aa", fontWeight: "bold", fontSize: "11px" }}
                formatter={(value: any) => [`Rp ${value.toLocaleString("id-ID")}`, "Pendapatan"]}
              />
              <Line
                type="monotone"
                dataKey="Pendapatan"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, stroke: "#121214", strokeWidth: 2, fill: "#34d399" }}
                activeDot={{ r: 7, stroke: "#121214", strokeWidth: 2, fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* JADWAL BOOKING HARI INI */}
      <div className="bg-[#121214] p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Jadwal Booking Hari Ini</h3>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
            {todayBookings.length} Pemesan
          </span>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 pb-2 scrollbar-none">
          <div className="inline-block min-w-full align-middle">
            {todayBookings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-xs text-zinc-500 italic">Hari ini belum ada jadwal lapangan yang dibooking pelanggan.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    <th className="pb-3 pl-2 whitespace-nowrap">Jam Main</th>
                    <th className="pb-3 whitespace-nowrap">Lapangan</th>
                    <th className="pb-3 whitespace-nowrap">Pelanggan</th>
                    <th className="pb-3 whitespace-nowrap">Kontak</th>
                    <th className="pb-3 text-right pr-2 whitespace-nowrap">Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-xs font-medium">
                  {todayBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3.5 pl-2 font-black text-white tabular-nums whitespace-nowrap">{booking.booking_time} WIB</td>
                      <td className="py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {booking.court_name}
                        </span>
                      </td>
                      <td className="py-3.5 text-zinc-300 font-bold whitespace-nowrap">{booking.user_name}</td>
                      <td className="py-3.5 text-zinc-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-zinc-600" /> {booking.user_phone || "-"}</div>
                      </td>
                      <td className="py-3.5 text-right pr-2 font-bold text-yellow-500 tabular-nums whitespace-nowrap">
                        Rp {booking.total_price?.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}