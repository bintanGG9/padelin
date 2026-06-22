"use client";

import { useState, useEffect } from "react";
import { format, startOfToday } from "date-fns";
import { supabase } from "@/lib/supabase";

// Tarif dasar per 30 menit (1 slot waktu di grid = 30 menit)
export const PRICE_PER_30_MIN = 135000; // Contoh: Paket 90 menit (3 slot) = Rp 405.000

export function useBooking(timeSlots: string[]) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourt, setSelectedCourt] = useState<string>("Court 1");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  // STATE BARU SESUAI GAMBAR UI
  const [mainDuration, setMainDuration] = useState<number>(90); // Default paket 90 Menit
  const [isExtraTime, setIsExtraTime] = useState<boolean>(false); // Toggle +30 Menit Extra

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  // HITUNG TOTAL MENIT AKTIF
  const totalDuration = mainDuration + (isExtraTime ? 30 : 0);

  // HITUNG HARGA DINAMIS BERDASARKAN TOTAL DURASI
  const currentBookingPrice = (totalDuration / 30) * PRICE_PER_30_MIN;

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(startOfToday());
    setCurrentTime(format(new Date(), "HH:mm:ss"));
    const timer = setInterval(() => setCurrentTime(format(new Date(), "HH:mm:ss")), 1000);
    const localData = localStorage.getItem("my_padel_bookings");
    if (localData) setMyBookings(JSON.parse(localData));
    return () => clearInterval(timer);
  }, []);

  // READ ACTION (Fetch Booking Terdaftar)
  useEffect(() => {
    if (!isMounted) return;
    
    const fetchBookedSlots = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("booking_time, total_price") // <-- AMBIL JUGA total_price ATAU duration UNTUK MENGHITUNG SLOT
        .eq("booking_date", format(selectedDate, "yyyy-MM-dd"))
        .eq("court_name", selectedCourt);
      
      // SEBELUMNYA: data.map((b) => b.booking_time)
      // SEKARANG: Kirim object utuh agar TimeGrid tahu durasi/harganya masing-masing
      if (data) {
        // ⚡ PERBAIKAN: Ubah data object dari database menjadi array string jam saja
        const slotsOnly = data.map((b: any) => b.booking_time);
        setBookedSlots(slotsOnly);   
      } 
    };
    
    fetchBookedSlots();
    if (!editingBookingId) setSelectedTime(null);
  }, [selectedDate, selectedCourt, isMounted, editingBookingId]);

  // CREATE / UPDATE ACTION
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !userName || !userPhone) return;
    setIsSubmitting(true);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    const currentIndex = timeSlots.indexOf(selectedTime);
    const slotsNeeded = totalDuration / 30; // Menghitung berapa kotak/slot grid yang harus dimakan
    
    const requiredSlots: string[] = [];
    for (let i = 0; i < slotsNeeded; i++) {
      if (timeSlots[currentIndex + i]) {
        requiredSlots.push(timeSlots[currentIndex + i]);
      }
    }

    if (requiredSlots.length < slotsNeeded) {
      alert(`Gagal Booking! Sisa jam operasional tidak cukup untuk durasi bermain ${totalDuration} menit.`);
      setIsSubmitting(false);
      return;
    }

    // Deteksi bentrok jadwal
    const isOverlap = bookedSlots.some((bookedTime) => requiredSlots.includes(bookedTime));

    if (isOverlap && !editingBookingId) {
      alert(`Gagal Booking! Slot rentang ${totalDuration} menit kedepan menabrak bokingan orang lain.`);
      setIsSubmitting(false);
      return;
    }

    if (editingBookingId) {
      const { error } = await supabase.from("bookings").update({
        booking_date: formattedDate, booking_time: selectedTime, court_name: selectedCourt, user_name: userName, user_phone: userPhone, total_price: currentBookingPrice
      }).eq("id", editingBookingId);

      if (!error) {
        const updated = myBookings.map(b => b.id === editingBookingId ? { 
          id: editingBookingId, booking_date: formattedDate, booking_time: selectedTime, court_name: selectedCourt, user_name: userName, user_phone: userPhone, total_price: currentBookingPrice 
        } : b);
        setMyBookings(updated);
        localStorage.setItem("my_padel_bookings", JSON.stringify(updated));
        alert("Booking diperbarui!");
      }
    } else { 
      const { data, error } = await supabase.from("bookings").insert([
        { booking_date: formattedDate, booking_time: selectedTime, court_name: selectedCourt, user_name: userName, user_phone: userPhone, total_price: currentBookingPrice }
      ]).select();
    
      if (data) {
        alert("Booking lapangan disimpan!");
        const updated = [...myBookings, data[0]];
        setMyBookings(updated);
        localStorage.setItem("my_padel_bookings", JSON.stringify(updated));
      }
    }
    
    setIsSubmitting(false); setShowForm(false); setEditingBookingId(null);
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm("Batalkan booking ini?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (!error) {
      const updated = myBookings.filter((b) => b.id !== id);
      setMyBookings(updated);
      localStorage.setItem("my_padel_bookings", JSON.stringify(updated));
      setSelectedDate(new Date(selectedDate));
      alert("Booking dibatalkan!");
    }
  };

  return {
    isMounted, selectedDate, setSelectedDate, selectedCourt, setSelectedCourt,
    selectedTime, setSelectedTime, currentTime, bookedSlots, myBookings,
    isSubmitting, showForm, setShowForm, userName, setUserName, userPhone, setUserPhone,
    editingBookingId, setEditingBookingId, mainDuration, setMainDuration, isExtraTime, setIsExtraTime,
    totalDuration, currentBookingPrice, handleSaveBooking, handleDeleteBooking
  };
}