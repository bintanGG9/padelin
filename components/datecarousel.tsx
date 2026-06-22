"use client";

import React, { useState, useEffect, useRef } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateCarouselProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export default function DateCarousel({ selectedDate, onSelect }: DateCarouselProps) {
  const [dates, setDates] = useState<Date[]>([]);
  
  // Ref ini sekarang langsung membidik elemen DIV native (Bukan component Radix lagi)
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = startOfToday();
    const generatedDates = Array.from({ length: 14 }, (_, i) => addDays(today, i));
    setDates(generatedDates);
  }, []);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      // scrollBy pasti jalan di native div dengan overflow-x-auto
      scrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  if (dates.length === 0) return <div className="h-28 w-full bg-zinc-900/10 animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-4">
      {/* TOMBOL NAVIGASI LEFT & RIGHT */}
      <div className="flex justify-end gap-1.5 -mt-12 mb-2 relative z-20">
        <Button 
          onClick={handleScrollLeft}
          type="button"
          variant="outline" 
          size="icon" 
          className="w-8 h-8 rounded-lg border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button 
          onClick={handleScrollRight}
          type="button"
          variant="outline" 
          size="icon" 
          className="w-8 h-8 rounded-lg border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative w-full">
        <div 
          ref={scrollRef} 
          className="w-full overflow-x-auto flex gap-3 px-2 py-3 scrollbar-none snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none', /* Untuk Firefox */
            msOverflowStyle: 'none',  /* Untuk IE dan Edge */
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            div::-webkit-scrollbar { display: none; }
          `}} />

          {dates.map((date) => {
            const isActive = isSameDay(date, selectedDate);
            const isTodayDay = isSameDay(date, startOfToday());
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => onSelect(date)}
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl min-w-[85px] h-28 border transition-all duration-200 shadow-lg tracking-wide focus:outline-none shrink-0 snap-start",
                  isActive 
                    ? "border-[#22c55e] bg-[#121214] ring-4 ring-[#22c55e]/20 scale-[1.03] z-10" 
                    : "bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:scale-[1.01]",
                  isTodayDay && !isActive && "border-zinc-700 bg-zinc-800/30"
                )}
              >
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isActive ? "text-[#22c55e]" : "text-zinc-500"
                )}>
                  {format(date, "EEE", { locale: id })}
                </span>
                
                <span className={cn(
                  "text-2xl font-black mt-1.5 tracking-tight",
                  isActive ? "text-white" : "text-zinc-200"
                )}>
                  {format(date, "d")}
                </span>
                
                <span className={cn(
                  "text-[9px] font-bold mt-1 uppercase tracking-widest",
                  isActive ? "text-[#22c55e]/70" : "text-zinc-500"
                )}>
                  {format(date, "MMM")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}