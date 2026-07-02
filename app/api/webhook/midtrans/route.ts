// ⚡ 1. Paksa rute ini menjadi dinamis agar dilewati saat proses build Vercel
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore
import midtransClient from "midtrans-client";

// ⚡ 2. Berikan fallback/string cadangan agar Supabase SDK tidak melempar eror saat build
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key"
);

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_TRANS_CLIENT_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Webhook] Data masuk dari Midtrans:", body);

    // Validasi notifikasi resmi dari Midtrans
    const statusResponse = await snap.transaction.notification(body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`[Webhook] Memproses Order ID: ${orderId} dengan Status: ${transactionStatus}`);

    // ⚡ EKSTRAKSI ID: Ubah "PADEL-24-1782936882432" menjadi angka "24"
    let bookingId = orderId;
    if (orderId.includes("-")) {
      const parts = orderId.split("-");
      bookingId = parts[1]; // Mengambil indeks ke-1 yaitu angka ID aslinya
    }

    // Tentukan status berdasarkan respon Midtrans
    let bookingStatus = "PENDING";
    if (transactionStatus === "capture" && fraudStatus === "accept") {
      bookingStatus = "PAID";
    } else if (transactionStatus === "settlement") {
      bookingStatus = "PAID";
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      bookingStatus = "CANCELLED";
    }

    console.log(`[Webhook] Mengupdate Booking ID: ${bookingId} menjadi status: ${bookingStatus}`);

    // ⚡ UPDATE DATABASE SUPABASE
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