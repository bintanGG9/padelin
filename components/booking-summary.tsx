"use client";

import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingSummaryProps {
  selectedCourt: string;
  selectedDate: Date;
  selectedTime: string | null;
  mainDuration: number;
  isExtraTime: boolean;
  totalDuration: number;
  currentBookingPrice: number;
  editingBookingId: number | null;
  onBookingClick: () => void;
}

export default function BookingSummary({
  selectedCourt, selectedDate, selectedTime, mainDuration, isExtraTime, totalDuration, currentBookingPrice, editingBookingId,
  onBookingClick
}: BookingSummaryProps) {
  return (
    <Card className="border border-zinc-800 bg-[#18181b] p-6 space-y-5 shadow-xl rounded-2xl">
      <h3 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-zinc-800 pb-3">Ringkasan Jadwal</h3>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs space-y-3">
        <p className="text-zinc-500 font-bold uppercase">Lapangan: <span className="text-[#22c55e] text-sm font-black block mt-0.5">{selectedCourt}</span></p>
        <p className="text-zinc-500 font-bold uppercase">Tanggal: <span className="text-zinc-200 font-extrabold block mt-0.5">{format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}</span></p>
        <p className="text-zinc-500 font-bold uppercase">Total Durasi: <span className="text-white font-extrabold block mt-0.5">{totalDuration} Menit <span className="text-zinc-500 font-normal text-[10px]">({mainDuration}m {isExtraTime && "+ 30m extra"})</span></span></p>
        {selectedTime && <p className="text-zinc-500 font-bold uppercase">Jam Mulai: <span className="text-white font-black block mt-0.5">{selectedTime} WITA</span></p>}
        <p className="text-zinc-500 font-bold uppercase">Estimasi Biaya: <span className="text-yellow-500 font-black block text-sm mt-1">Rp {currentBookingPrice.toLocaleString("id-ID")}</span></p>
      </div>

      <Button 
        onClick={onBookingClick} 
        disabled={!selectedTime} 
        className={cn("w-full h-12 text-xs font-black uppercase rounded-xl text-[#09090b] flex items-center justify-center gap-2 transition-all", 
          selectedTime ? "bg-[#22c55e] hover:bg-[#16a34a]" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        )}
      >
        <ArrowRight className="w-4 h-4 order-last" /> {editingBookingId ? "Simpan Perubahan" : "Isi Data dan Lanjutkan"}
      </Button>
    </Card>
  );
}