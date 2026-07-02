// 1. HAPUS baris force-dynamic yang tadi bikin eror static export
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore
import midtransClient from "midtrans-client";

// 2. Gunakan fungsi pembungkus (Lazy Initialization) agar Supabase client 
// HANYA dibuat ketika ada webhook masuk (saat runtime), bukan saat aplikasi sedang di-build statis.
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
  return createClient(url, serviceKey);
};

// Inisialisasi Snap Midtrans (aman jika variabel kosong saat build statis)
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "placeholder",
  clientKey: process.env.NEXT_PUBLIC_TRANS_CLIENT_KEY || "placeholder",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Webhook] Data masuk dari Midtrans:", body);

    const statusResponse = await snap.transaction.notification(body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let bookingId = orderId;
    if (orderId.includes("-")) {
      const parts = orderId.split("-");
      bookingId = parts[1];
    }

    let bookingStatus = "PENDING";
    if (transactionStatus === "capture" && fraudStatus === "accept") {
      bookingStatus = "PAID";
    } else if (transactionStatus === "settlement") {
      bookingStatus = "PAID";
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      bookingStatus = "CANCELLED";
    }

    console.log(`[Webhook] Mengupdate Booking ID: ${bookingId} menjadi status: ${bookingStatus}`);

    // 3. Panggil client Supabase di sini menggunakan fungsi pembungkus tadi
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("bookings")
      .update({ status: bookingStatus })
      .eq("id", bookingId);

    if (error) {
      console.error("[Webhook] Gagal update database Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[Webhook] Berhasil! Database Supabase terupdate.");
    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("[Webhook Fatal Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. Tambahkan ini agar compiler Next.js mengizinkan file ini masuk dalam kompilasi static export tanpa eror
export async function generateStaticParams() {
  return [];
}