"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phoneNumber: string; // Format: "628123456789" (Gunakan kode negara, tanpa tanda + atau angka 0 di depan)
  message?: string;    // Pesan otomatis awal yang akan dikirim user
}

export default function WhatsAppButton({ phoneNumber, message = "Halo, saya ingin bertanya informasi lebih lanjut mengenai booking lapangan padel." }: WhatsAppButtonProps) {
  
  const handleOpenWhatsApp = () => {
    // Mengubah spasi dan karakter khusus teks agar aman di URL (URL Encode)
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Membuka tautan WhatsApp di tab baru secara aman
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      onClick={handleOpenWhatsApp}
      type="button"
      className="w-full h-12 bg-[#25D366] hover:bg-[#20ba56] text-white font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all border-none"
    >
      <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
      Hubungi via WhatsApp
    </Button>
  );
}