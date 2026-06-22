"use client";

import React from "react";
import { CalendarDays, MapPin, Clock, AlertCircle } from "lucide-react";

import { useBooking } from "@/hooks/use-booking";
import DateCarousel from "@/components/datecarousel"; 
import CourtSelector from "@/components/court-selector";
import TimeGrid from "@/components/time-grid";
import BookingForm from "@/components/booking-form";
import MyBookings from "@/components/my-bookings";
import WhatsAppButton from "@/components/whatsapp-button";
import BookingSummary from "@/components/booking-summary";
import DurationSelector from "@/components/duration-selector"; // Import Baru

import { Card } from "@/components/ui/card";

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

export default function SchedulePage() {
  const b = useBooking(TIME_SLOTS);

  if (!b.isMounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased">
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white uppercase">Pilih Jadwal <span className="text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-xl border border-[#22c55e]/20">Booking</span></h1>
          <div className="inline-flex mt-5 items-center gap-1.5 bg-[#18181b] text-[#22c55e] text-xs font-bold px-4 py-2 rounded-full border border-zinc-800 shadow-xl">
            <MapPin className="w-3.5 h-3.5 fill-[#22c55e] text-[#09090b]" /> Padelin, Jimbaran, Bali (4 Available Courts)
          </div>
        </div>

        {/* MODAL POPUP FORM */}
        {b.showForm && b.selectedTime && (
          <BookingForm 
            isEditMode={!!b.editingBookingId} selectedCourt={b.selectedCourt} selectedDate={b.selectedDate} selectedTime={b.selectedTime}
            userName={b.userName} userPhone={b.userPhone} isSubmitting={b.isSubmitting} courtPrice={b.currentBookingPrice} onChangeName={b.setUserName}
            onChangePhone={b.setUserPhone} onChangeCourt={b.setSelectedCourt} onChangeTime={b.setSelectedTime} onClose={() => { b.setShowForm(false); b.setEditingBookingId(null); }} onSubmit={b.handleSaveBooking}
          />
        )}

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <Card className="md:col-span-5 border border-zinc-800 bg-[#18181b] p-6 flex items-center gap-4 shadow-xl">
            <Clock className="w-7 h-7 text-[#22c55e]" />
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Waktu Sekarang</p>
              <h2 className="text-3xl font-black text-white tabular-nums">{b.currentTime}</h2>
            </div>
          </Card>
          <Card className="md:col-span-7 border border-zinc-800 bg-[#18181b] p-6 flex items-start gap-4 shadow-xl">
            <AlertCircle className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-200 uppercase">Informasi</h4>
              <p className="text-xs text-zinc-400">Silakan tentukan durasi bermain, ekstra waktu, dan pilih lapangan kosong yang tersedia.</p>
            </div>
          </Card>
        </div>

        {/* WORKSPACE CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* KOLOM KIRI (URUTAN PROSES) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border border-zinc-800 bg-[#18181b] p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-5"><CalendarDays className="w-4 h-4 text-[#22c55e]" /><h3 className="font-extrabold text-sm text-white uppercase">1. Pilih Tanggal</h3></div>
              <DateCarousel selectedDate={b.selectedDate} onSelect={b.setSelectedDate} />
            </Card>

            <TimeGrid timeSlots={TIME_SLOTS} selectedDate={b.selectedDate} bookedSlots={b.bookedSlots} selectedTime={b.selectedTime} onSelectTime={b.setSelectedTime} />

            <CourtSelector selectedCourt={b.selectedCourt} onSelectCourt={b.setSelectedCourt} />

            {/* BARU: Durasi diletakkan di bawah Pilih Court */}
            <DurationSelector 
              mainDuration={b.mainDuration}
              isExtraTime={b.isExtraTime}
              setMainDuration={b.setMainDuration}
              setIsExtraTime={b.setIsExtraTime}
            />
          </div>

          {/* KOLOM KANAN (SIDEBAR RINGKASAN JADWAL) */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
            
            <BookingSummary 
              selectedCourt={b.selectedCourt}
              selectedDate={b.selectedDate}
              selectedTime={b.selectedTime}
              mainDuration={b.mainDuration}
              isExtraTime={b.isExtraTime}
              totalDuration={b.totalDuration}
              currentBookingPrice={b.currentBookingPrice}
              editingBookingId={b.editingBookingId}
              onBookingClick={() => b.setShowForm(true)}
            />

            {b.myBookings.length > 0 && (
              <MyBookings bookings={b.myBookings} onEdit={(data) => {
                b.setEditingBookingId(data.id); b.setSelectedDate(new Date(data.booking_date)); b.setSelectedCourt(data.court_name); b.setSelectedTime(data.booking_time); b.setUserName(data.user_name); b.setUserPhone(data.user_phone); b.setShowForm(true);
              }} onDelete={b.handleDeleteBooking} />
            )}

            <Card className="border border-zinc-800 bg-[#18181b] p-6 space-y-3 shadow-xl rounded-2xl">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Butuh Bantuan?</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">Jika mengalami kendala sistem atau ingin menanyakan jadwal turnamen, silakan hubungi admin.</p>
              </div>
              <WhatsAppButton phoneNumber="62895357150501" message="Hallo admin, saya ingin bertanya informasi lebih lanjut mengenai booking lapangan padel." />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}