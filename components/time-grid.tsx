"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";

interface TimeGridProps {
  timeSlots: string[];
  bookedSlots: any[];
  selectedTime: string | null;
  selectedDate: Date;
  onSelectTime: (time: string) => void;
}

export default function TimeGrid({ 
  timeSlots, 
  bookedSlots, 
  selectedTime, 
  selectedDate, 
  onSelectTime 
}: TimeGridProps) {
  
  const now = new Date();
  const currentTimeString = format(now, "HH:mm");

  return (
    <Card className="border border-zinc-800 bg-[#18181b] p-6 shadow-xl rounded-2xl">
      <div className="flex items-center gap-3 mb-5">
        <Clock className="w-4 h-4 text-[#22c55e]" />
        <h3 className="font-extrabold text-sm text-white uppercase">2. Pilih Waktu Mulai</h3>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {timeSlots.map((time) => {
          
          // 1. VALIDASI JIKA WAKTU SUDAH LEWAT
          const isPast = isToday(selectedDate) && time < currentTimeString;

          // 2. VALIDASI JIKA WAKTU SUDAH TERISI BOOKING
          const isAlreadyBooked = bookedSlots.some((booking) => {
            const startHour = typeof booking === "object" ? booking.booking_time : booking;
            
            let durationOfBooked = 90; 
            if (typeof booking === "object") {
              if (booking.duration) durationOfBooked = booking.duration;
              else if (booking.total_price) durationOfBooked = (booking.total_price / 135000) * 30; 
            }

            const slotsOccupied = durationOfBooked / 30; 
            const bookedIdx = timeSlots.indexOf(startHour);
            const currentIdx = timeSlots.indexOf(time);

            return bookedIdx !== -1 && currentIdx >= bookedIdx && currentIdx < bookedIdx + slotsOccupied;
          });

          const isDisabled = isPast || isAlreadyBooked;
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectTime(time)}
              className={cn(
                "relative h-12 text-xs font-bold rounded-xl border transition-all tabular-nums flex flex-col items-center justify-center overflow-hidden",
                // ❌ TAMPILAN JIKA DISABLED (WAKTU LEWAT / TERISI PENUH)
                isDisabled
                  ? "bg-zinc-900 border-zinc-800/60 text-zinc-500 cursor-not-allowed line-through"
                  : // 🟦 TAMPILAN JIKA SEDANG DIPILIH USER
                  isSelected
                  ? " text-white border-[#22c55e] shadow-md shadow-blue-600/20 font-black"
                  : // 🟩 TAMPILAN JIKA AKTIF & TERSEDIA UNTUK DIBOOKING
                  "bg-zinc-900 text-[#22c55e] border-zinc-800"
              )}
            >
              {/* Tampilkan Jam Utama */}
              <span className={cn(isDisabled && "text-zinc-600 font-normal")}>{time}</span>
              
              {/* Badge Label Status Kecil di bagian bawah/atas slot jika dinonaktifkan */}
              {isPast && (
                <span className="absolute top-0.5 right-1 text-[8px] font-black uppercase text-zinc-500 tracking-tighter scale-90">
                  Lewat
                </span>
              )}
              {!isPast && isAlreadyBooked && (
                <span className="absolute top-0.5 right-1 text-[8px] font-black uppercase text-red-500/80 tracking-tighter scale-90">
                  Penuh
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}