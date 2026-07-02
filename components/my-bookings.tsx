"use client";

import React from "react";
import { Edit2, Trash2, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MyBookingsProps {
  bookings: any[];
  onEdit: (booking: any) => void;
  onDelete: (id: number) => void;
}

export default function MyBookings({ bookings, onEdit, onDelete }: MyBookingsProps) {
  
  // ⚡ LOGIKA FUNGSI CETAK INVOICE + JAM SELESAI OTOMATIS
  const handleCetakInvoice = (booking: any) => {
    // 1. Hitung Jam Selesai berdasarkan booking_time + durasi (diambil dari total_price)
    let jamSelesai = "--:--";
    if (booking.booking_time && booking.total_price) {
      const totalMenit = (booking.total_price / 135000) * 30; // 1 slot 30 mnt = Rp 135rb
      const [startHour, startMinute] = booking.booking_time.split(":").map(Number);
      
      // Kalkulasi objek waktu
      const targetTime = new Date();
      targetTime.setHours(startHour);
      targetTime.setMinutes(startMinute + totalMenit);
      
      // Format kembali ke string HH:MM
      const endHour = String(targetTime.getHours()).padStart(2, "0");
      const endMinute = String(targetTime.getMinutes()).padStart(2, "0");
      jamSelesai = `${endHour}:${endMinute}`;
    }

    // 2. Membuat iframe tersembunyi di latar belakang dokumen
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // ⚡ MENENTUKAN TEKS & GAYA WARNA STATUS UNTUK STRUK PRINT
    const currentStatus = booking.status || "PENDING";
    
    const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
      PAID: { bg: "#d1fae5", text: "#065f46", label: "🟢 LUNAS (PAID)" },
      PENDING: { bg: "#fef3c7", text: "#92400e", label: "🟡 MENUNGGU PEMBAYARAN" },
      CANCELLED: { bg: "#fee2e2", text: "#991b1b", label: "🔴 DIBATALKAN" },
    };

    const currentStyle = statusStyles[currentStatus] || { bg: "#f3f4f6", text: "#374151", label: currentStatus };

    // 3. Menyusun struktur HTML nota belanja dengan tambahan BARIS STATUS PEMBAYARAN
    doc.write(`
      <html>
        <head>
          <title>Invoice Padelin - ${booking.id}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 15px; }
            .title { font-size: 22px; font-weight: bold; color: #22c55e; }
            .details { margin-top: 25px; line-height: 2; font-size: 14px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; }
            .bold { font-weight: bold; }
            
            /* Style badge khusus versi cetak HTML */
            .badge { 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 11px; 
              font-weight: bold; 
              text-transform: uppercase;
              background-color: ${currentStyle.bg} !important;
              color: ${currentStyle.text} !important;
              -webkit-print-color-adjust: exact; /* Memaksa printer memunculkan warna background */
              print-color-adjust: exact;
            }
            
            .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">PADELIN COURT INVOICE</div>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Bukti Pemesanan Slot Lapangan Padel Online</p>
          </div>
          <div class="details">
            <div class="row"><span class="bold">ID Booking:</span> <span>#PAD-${String(booking.id).slice(0, 5)}</span></div>
            
            <div class="row">
              <span class="bold">Status Pembayaran:</span> 
              <span class="badge">${currentStyle.label}</span>
            </div>
            
            <div class="row"><span class="bold">Nama Penyewa:</span> <span>${booking.user_name || "Pelanggan"}</span></div>
            <div class="row"><span class="bold">No. WhatsApp:</span> <span>${booking.user_phone || "-"}</span></div>
            <div class="row"><span class="bold">Tanggal Main:</span> <span>${booking.booking_date}</span></div>
            
            <div class="row"><span class="bold">Jam Mulai:</span> <span>${booking.booking_time} WIB</span></div>
            <div class="row"><span class="bold">Jam Selesai:</span> <span>${jamSelesai} WIB</span></div>
            
            <div class="row"><span class="bold">Lapangan:</span> <span>${booking.court_name}</span></div>
            <div class="row" style="border-top: 1px solid #ccc; padding-top: 10px; margin-top: 15px; font-size: 16px;">
              <span class="bold">TOTAL BAYAR:</span> 
              <span class="bold" style="color: #22c55e;">Rp ${(booking.total_price || 0).toLocaleString("id-ID")}</span>
            </div>
          </div>
          <div class="footer">
            <p>Harap tunjukkan struk digital/cetak ini kepada admin saat tiba di lokasi lapangan.</p>
            <p>Padelin App © 2026</p>
          </div>
        </body>
      </html>
    `);

    doc.close();

    // 4. Eksekusi perintah print langsung dari iframe
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  return (
    <Card className="border border-zinc-800 bg-[#18181b] rounded-2xl p-6 space-y-4 shadow-xl">
      <h4 className="text-xs font-black text-[#22c55e] uppercase tracking-widest">📋 Jadwal Main Kamu</h4>
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {bookings.map((b) => {
          // Menentukan visual warna kecil untuk list text frontend
          const isPaid = b.status === "PAID";
          const isCancelled = b.status === "CANCELLED";
          const statusText = isPaid ? "Lunas" : isCancelled ? "Batal" : "Pending";
          const statusColor = isPaid ? "text-green-500" : isCancelled ? "text-red-500" : "text-yellow-500";

          return (
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white">{b.booking_time}</span>
                  <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{b.court_name}</span>
                  
                  {/* Badge Status Kecil di Samping Nama Lapangan (Frontend) */}
                  <span className={`text-[9px] font-bold px-1 rounded bg-zinc-800/80 ${statusColor}`}>
                    {statusText}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">{b.booking_date}</p>
                <p className="text-[10px] text-yellow-500 font-bold mt-0.5">Rp {b.total_price?.toLocaleString("id-ID") || "0"}</p>
              </div>
              
              {/* AKSI TOMBOL */}
              <div className="flex gap-1 shrink-0">
                {/* Tombol Cetak */}
                <Button 
                  onClick={() => handleCetakInvoice(b)} 
                  size="icon" 
                  variant="ghost" 
                  className="w-7 h-7 bg-zinc-800 text-amber-500 hover:text-amber-400 hover:bg-zinc-700"
                  title="Cetak Struk"
                >
                  <Printer className="w-3.5 h-3.5" />
                </Button>

                <Button onClick={() => onEdit(b)} size="icon" variant="ghost" className="w-7 h-7 bg-zinc-800 text-zinc-400"><Edit2 className="w-3.5 h-3.5" /></Button>
                <Button onClick={() => onDelete(b.id)} size="icon" variant="ghost" className="w-7 h-7 bg-red-950/30 text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}