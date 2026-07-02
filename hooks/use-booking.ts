"use client";

import { useState, useEffect } from "react";
import { format, startOfToday } from "date-fns";
import { supabase } from "@/lib/supabase";

// Tarif dasar per 30 menit (1 slot waktu di grid = 30 menit)
export const PRICE_PER_30_MIN = 135000; 

export function useBooking(timeSlots: string[]) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourt, setSelectedCourt] = useState<string>("Court 1");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const [mainDuration, setMainDuration] = useState<number>(90); 
  const [isExtraTime, setIsExtraTime] = useState<boolean>(false); 

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  const totalDuration = mainDuration + (isExtraTime ? 30 : 0);
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

  // READ ACTION
  useEffect(() => {
    if (!isMounted) return;
    
    const fetchBookedSlots = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("booking_time, total_price")
        .eq("booking_date", format(selectedDate, "yyyy-MM-dd"))
        .eq("court_name", selectedCourt);
      
      if (data) {
        const slotsOnly = data.map((b: any) => b.booking_time);
        setBookedSlots(slotsOnly);   
      } 
    };
    
    fetchBookedSlots();
    if (!editingBookingId) setSelectedTime(null);
  }, [selectedDate, selectedCourt, isMounted, editingBookingId]);

  // CREATE / UPDATE ACTION INTEGRASI MIDTRANS
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !userName || !userPhone) return;
    setIsSubmitting(true);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    const currentIndex = timeSlots.indexOf(selectedTime);
    const slotsNeeded = totalDuration / 30; 
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

    const isOverlap = bookedSlots.some((bookedTime) => requiredSlots.includes(bookedTime));

    if (isOverlap && !editingBookingId) {
      alert(`Gagal Booking! Slot rentang ${totalDuration} menit kedepan menabrak bokingan orang lain.`);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingBookingId) {
        // Logika Update (Jika admin mengedit data)
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
          setShowForm(false);
          setEditingBookingId(null);
        }
      } else { 
        // ⚡ 1. SIMPAN DATA KE SUPABASE DENGAN STATUS DEFAULT "PENDING"
        const { data, error } = await supabase.from("bookings").insert([
          { 
            booking_date: formattedDate, 
            booking_time: selectedTime, 
            court_name: selectedCourt, 
            user_name: userName, 
            user_phone: userPhone, 
            total_price: currentBookingPrice,
            status: "PENDING" // Pastikan kolom ini ada di Supabase kamu
          }
        ]).select();
      
        if (error) throw new Error(error.message);

        if (data && data.length > 0) {
          const createdBooking = data[0];

          // ⚡ 2. REKUES TOKEN DARI ENDPOINT BACKEND API NEXT.JS
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: createdBooking.id,
              totalPrice: currentBookingPrice,
              userName: userName,
              userPhone: userPhone,
            }),
          });

          const checkoutData = await res.json();
          if (!res.ok) throw new Error(checkoutData.error || "Gagal mendapatkan token kasir.");

          // ⚡ 3. PANGGIL KASIR POP-UP MIDTRANS SNAP
          if (window.snap) {
            window.snap.pay(checkoutData.token, {
              onSuccess: function (result: any) {
                alert("Pembayaran Terverifikasi! Jadwal bermain Anda telah aman.");
                const updated = [...myBookings, { ...createdBooking, status: "PAID" }];
                setMyBookings(updated);
                localStorage.setItem("my_padel_bookings", JSON.stringify(updated));
                setShowForm(false);
              },
              onPending: function (result: any) {
                alert("Pesanan disimpan! Silakan selesaikan pembayaran pada instruksi tagihan.");
                const updated = [...myBookings, createdBooking];
                setMyBookings(updated);
                localStorage.setItem("my_padel_bookings", JSON.stringify(updated));
                setShowForm(false);
              },
              onError: function (result: any) {
                alert("Sistem pembayaran error. Silakan hubungi admin lapangan.");
              },
              onClose: function () {
                alert("Anda membatalkan proses checkout kasir.");
                // Tetap simpan sebagai riwayat tertunda
                const updated = [...myBookings, createdBooking];
                setMyBookings(updated);
                localStorage.setItem("my_padel_bookings", JSON.stringify(updated));
                setShowForm(false);
              }
            });
          } else {
            alert("Sistem gagal memuat modul payment gateway. Silakan segarkan halaman.");
          }
        }
      }
    } catch (err: any) {
      alert(`Terjadi Kendala: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
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