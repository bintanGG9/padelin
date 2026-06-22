"use client";

import React from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookingFormProps {
  isEditMode: boolean;
  selectedCourt: string;
  selectedDate: Date;
  selectedTime: string;
  userName: string;
  userPhone: string;
  isSubmitting: boolean;
  courtPrice: number;
  onChangeName: (name: string) => void;
  onChangePhone: (phone: string) => void;
  // Tambahkan fungsi handler agar state di page utama ikut berubah saat dropdown diganti
  onChangeCourt?: (court: string) => void;
  onChangeTime?: (time: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

// Daftar opsi untuk Dropdown di dalam modal
const AVAILABLE_COURTS = ["Court 1", "Court 2", "Court 3", "Court 4"];

// Generator jam untuk dropdown (07:00 - 21:30)
const generateTimeOptions = () => {
  const slots = [];
  let hour = 7; let minute = 0;
  while (hour < 22 || (hour === 21 && minute <= 30)) {
    slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    minute += 30; if (minute === 60) { minute = 0; hour += 1; }
  }
  return slots;
};
const TIME_OPTIONS = generateTimeOptions();

export default function BookingForm({
  isEditMode, selectedCourt, selectedDate, selectedTime, userName, userPhone, isSubmitting, courtPrice,
  onChangeName, onChangePhone, onChangeCourt, onChangeTime, onClose, onSubmit
}: BookingFormProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-zinc-800 bg-[#18181b] p-6 space-y-4">
        <h3 className="text-lg font-black text-white uppercase">
          {isEditMode ? "📝 Edit Booking" : "📋 Data Pelanggan"}
        </h3>
        
        <form onSubmit={onSubmit} className="space-y-4 text-sm">
          {/* INPUT NAMA LENGKAP */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-bold text-xs uppercase">Nama Lengkap</label>
            <input 
              type="text" required value={userName} onChange={(e) => onChangeName(e.target.value)}
              className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          {/* INPUT NOMOR WHATSAPP */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-bold text-xs uppercase">Nomor WhatsApp</label>
            <input 
              type="tel" required value={userPhone} onChange={(e) => onChangePhone(e.target.value)}
              className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          {/* AREA EDIT LAPANGAN & JAM (DROPDOWN) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400 font-bold text-xs uppercase">📍 Lapangan</label>
              <select
                value={selectedCourt}
                onChange={(e) => onChangeCourt && onChangeCourt(e.target.value)}
                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-3 text-white text-xs focus:outline-none focus:border-[#22c55e] cursor-pointer"
              >
                {AVAILABLE_COURTS.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-bold text-xs uppercase">⏰ Jam Main</label>
              <select
                value={selectedTime}
                onChange={(e) => onChangeTime && onChangeTime(e.target.value)}
                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-xl px-3 text-white text-xs focus:outline-none focus:border-[#22c55e] cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-zinc-900 text-white">{t} WITA</option>
                ))}
              </select>
            </div>
          </div>

          {/* INFORMASI RINGKASAN STABIL */}
          <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <p>📅 Tanggal Main: <span className="text-white font-bold">{format(selectedDate, "dd MMMM yyyy")}</span></p>
            <p className="pt-1 border-t border-zinc-800/60 mt-1">
              💵 Total Biaya: <span className="text-yellow-500 font-extrabold text-sm">Rp {(courtPrice ?? 0).toLocaleString("id-ID")}</span>
            </p>
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-400">Batal</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#22c55e] text-black font-black">
              {isSubmitting ? "Menyimpan..." : "Konfirmasi"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}