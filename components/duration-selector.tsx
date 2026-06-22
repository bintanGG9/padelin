"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DurationSelectorProps {
  mainDuration: number;
  isExtraTime: boolean;
  setMainDuration: (duration: number) => void;
  setIsExtraTime: (active: boolean) => void;
}

export default function DurationSelector({
  mainDuration,
  isExtraTime,
  setMainDuration,
  setIsExtraTime,
}: DurationSelectorProps) {
  return (
    <Card className="border border-zinc-800 bg-[#18181b] p-6 space-y-6 shadow-xl rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">3. Pilih Durasi</h3>
          <p className="text-[11px] text-zinc-500">Berapa lama Anda ingin bermain?</p>
        </div>
      </div>

      {/* Grid Opsi Menit */}
      <div className="grid grid-cols-3 gap-3">
        {[60, 90, 120].map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => setMainDuration(duration)}
            className={cn(
              "py-4 flex flex-col items-center justify-center rounded-2xl border transition-all space-y-1",
              mainDuration === duration 
                ? "bg-purple-600/10 border-purple-500 text-purple-400 font-black shadow-lg shadow-purple-500/5" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            )}
          >
            <span className="text-xl font-black tabular-nums">{duration}</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Menit</span>
          </button>
        ))}
      </div>

      {/* Toggle Switch Tambah Waktu Extra */}
      <div className={cn(
        "border rounded-2xl p-4 flex items-center justify-between transition-all duration-300",
        isExtraTime ? "bg-amber-500/5 border-amber-500/30" : "bg-zinc-900/50 border-zinc-800"
      )}>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-500 uppercase tracking-wider">+ Tambah Waktu Extra</span>
            <span className="text-[9px] bg-amber-500/10 text-amber-500 font-black px-1.5 py-0.5 rounded-md border border-amber-500/20">Optional</span>
          </div>
          <p className="text-[11px] text-zinc-500">Perpanjang waktu bermain Anda dengan tambahan 30 menit</p>
        </div>
        
        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsExtraTime(!isExtraTime)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none",
            isExtraTime ? "bg-amber-500" : "bg-zinc-800"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
              isExtraTime ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
    </Card>
  );
}