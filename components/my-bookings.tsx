"use client";

import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MyBookingsProps {
  bookings: any[];
  onEdit: (booking: any) => void;
  onDelete: (id: number) => void;
}

export default function MyBookings({ bookings, onEdit, onDelete }: MyBookingsProps) {
  return (
    <Card className="border border-zinc-800 bg-[#18181b] rounded-2xl p-6 space-y-4 shadow-xl">
      <h4 className="text-xs font-black text-[#22c55e] uppercase tracking-widest">📋 Jadwal Main Kamu</h4>
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {bookings.map((b) => (
          <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white">{b.booking_time}</span>
                <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{b.court_name}</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">{b.booking_date}</p>
              <p className="text-[10px] text-yellow-500 font-bold mt-0.5">Rp {b.total_price?.toLocaleString("id-ID") || "0"}</p>
            </div>
            <div className="flex gap-1">
              <Button onClick={() => onEdit(b)} size="icon" variant="ghost" className="w-7 h-7 bg-zinc-800 text-zinc-400"><Edit2 className="w-3.5 h-3.5" /></Button>
              <Button onClick={() => onDelete(b.id)} size="icon" variant="ghost" className="w-7 h-7 bg-red-950/30 text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}