"use client";

import React, { useState, useEffect } from "react";
import { format, addDays, startOfToday } from "date-fns";
import { id } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, CalendarDays, Layers, User, Phone, Clock, Wallet, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const generateTimeSlots = () => {
  const slots = [];
  let hour = 7; let minute = 0;
  while (hour < 22 || (hour === 21 && minute <= 30)) {
    slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    minute += 30; if (minute === 60) { minute = 0; hour += 1; }
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots();
const COURTS = ["Court 1", "Court 2", "Court 3", "Court 4"];

export default function MasterSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const fetchMasterSchedule = async () => {
    setLoading(true);
    // ⚡ PERBAIKAN: Bungkus await dari supabase.from() sebelum memanggil .eq()
    const { data } = await supabase
      .from("bookings")
      .select("*") // Tambahkan select untuk memastikan data ditarik penuh
      .eq("booking_date", format(selectedDate, "yyyy-MM-dd"));
      
    if (data) setAllBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMasterSchedule();
  }, [selectedDate]);

  const handleDeleteBooking = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan dan menghapus booking ini? Data tidak dapat dikembalikan.")) return;
    
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (!error) {
      alert("Booking berhasil dibatalkan!");
      setSelectedBooking(null);
      fetchMasterSchedule();
    } else {
      alert("Gagal menghapus booking.");
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* HEADER CONTROL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121214] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            <h1 className="text-lg font-black uppercase tracking-tight">Master Schedule Grid</h1>
          </div>
          <p className="text-[11px] text-zinc-500">Klik slot jadwal yang terisi untuk melihat detail atau menghapus booking.</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black uppercase text-zinc-200 px-4 tabular-nums">
            {format(selectedDate, "EEEE, d MMM yyyy", { locale: id })}
          </span>
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MATRIX GRID BOARD */}
      <Card className="border border-zinc-800 bg-[#121214] shadow-xl rounded-2xl overflow-hidden p-6">
        {loading ? (
          <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest py-10 text-center">Sinkronisasi matriks grid...</div>
        ) : (
          <div className="space-y-8">
            {COURTS.map((court) => (
              <div key={court} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-500 tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-zinc-500" />
                  {court}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {TIME_SLOTS.map((time) => {
                    
                    const bookingMatch = allBookings.find((b) => {
                      if (b.court_name !== court) return false;
                      
                      let durationOfBooked = b.duration || 90;
                      if (!b.duration && b.total_price) {
                        durationOfBooked = (b.total_price / 135000) * 30;
                      }

                      const slotsOccupied = durationOfBooked / 30;
                      const bookedIdx = TIME_SLOTS.indexOf(b.booking_time);
                      const currentIdx = TIME_SLOTS.indexOf(time);

                      return bookedIdx !== -1 && currentIdx >= bookedIdx && currentIdx < bookedIdx + slotsOccupied;
                    });

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!bookingMatch}
                        onClick={() => bookingMatch && setSelectedBooking(bookingMatch)}
                        className={cn(
                          "h-14 p-2 rounded-xl border flex flex-col justify-between text-left transition-all select-none tabular-nums relative overflow-hidden group w-full",
                          bookingMatch
                            ? "bg-red-500/5 border-red-500/20 text-red-400 cursor-pointer hover:bg-red-500/10 hover:border-red-500/40"
                            : "bg-zinc-950 border-zinc-900 text-zinc-500 cursor-default"
                        )}
                      >
                        <span className={cn("text-[10px] font-black block tracking-tight", bookingMatch ? "text-red-400" : "text-zinc-500")}>
                          {time}
                        </span>
                        
                        {bookingMatch ? (
                          <span className="text-[9px] font-black uppercase tracking-tighter truncate text-red-500/90 block group-hover:text-red-400 transition-colors">
                            {bookingMatch.user_name}
                          </span>
                        ) : (
                          <span className="text-[8px] font-bold uppercase text-zinc-800 tracking-widest block">
                            Kosong
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* MODAL POPUP: DETAIL BOOKING & HAPUS */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="border border-zinc-800 bg-[#121214] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Detail Jadwal Booking</h3>
                <p className="text-[11px] text-zinc-500">ID Referensi: #{selectedBooking.id}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-zinc-400 font-bold uppercase tracking-wide">
                    Nama: <span className="text-white font-black block mt-0.5 normal-case text-sm">{selectedBooking.user_name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-zinc-400 font-bold uppercase tracking-wide">
                    No. WhatsApp: <span className="text-zinc-200 font-extrabold block mt-0.5 tabular-nums">{selectedBooking.user_phone}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-zinc-400 font-bold uppercase tracking-wide">
                    Area Lapangan: <span className="text-[#22c55e] font-black block mt-0.5">{selectedBooking.court_name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-zinc-400 font-bold uppercase tracking-wide">
                    Waktu Mulai: <span className="text-white font-extrabold block mt-0.5">{selectedBooking.booking_time} WITA</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-zinc-400 font-bold uppercase tracking-wide">
                    Biaya Masuk: <span className="text-yellow-500 font-black block mt-0.5 text-sm">Rp {selectedBooking.total_price?.toLocaleString("id-ID")}</span>
                  </p>
                </div>
              </div>

              {/* HANYA TOMBOL HAPUS / PEMBATALAN */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  className="w-full h-11 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Batalkan & Hapus Booking
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}