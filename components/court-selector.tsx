"use client";

import React from "react";
import { Layers, MapPin } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COURTS = ["Court 1", "Court 2", "Court 3", "Court 4"];

interface CourtSelectorProps {
  selectedCourt: string;
  onSelectCourt: (court: string) => void;
}

export default function CourtSelector({
  selectedCourt,
  onSelectCourt,
}: CourtSelectorProps) {
  return (
    <Card className="border border-zinc-800 bg-[#18181b] p-6 shadow-xl">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-zinc-900 p-2 text-[#22c55e]">
          <Layers className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="mt-1 text-sm font-extrabold uppercase tracking-wider text-white">3. Pilih Lapangan Padel</h3>
          <div className="mt-4 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="mb-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#22c55e]" />
              <h4 className="text-sm font-extrabold capitalize text-[#22c55e]">Padelin Jimbaran</h4>
            </div>

            <div className="text-[10px] text-zinc-400 mb-2"><p >Kawasan Jimbaran Hub Jalan Karang Mas Sejahtera, Jl. Pura Taksu, Jimbaran, Kec. Kuta Sel., Kabupaten Badung, Bali 80361</p></div>

            {/* Courts */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {COURTS.map((court) => {
                const isSelected = selectedCourt === court;

                return (
                  <button
                    key={court}
                    type="button"
                    onClick={() => onSelectCourt(court)}
                    className={cn(
                      "h-14 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-200",
                      isSelected
                        ? "border-[#22c55e] bg-zinc-900 text-[#22c55e] ring-2 ring-[#22c55e]/20"
                        : "border-zinc-800 bg-zinc-900/50 text-[#22c55e] hover:border-zinc-700 hover:text-zinc-200"
                    )}
                  >
                    {court}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}