import { NextResponse } from "next/server";
// @ts-ignore
import midtransClient from "midtrans-client";

// Inisialisasi Snap client di LUAR export
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_TRANS_CLIENT_KEY, // Jika di client-side menggunakan NEXT_PUBLIC_
});

export async function POST(request: Request) {
  try {
    const { bookingId, totalPrice, userName, userPhone } = await request.json();

    console.log("[Checkout API] Menerima data request:", { bookingId, totalPrice, userName, userPhone });

    // ⚡ DI DALAM EXPORT: Proses pembersihan nomor HP dilakukan di sini
    const cleanPhone = userPhone ? userPhone.replace(/[^0-9]/g, "") : "";
    
    // Jika nomor HP yang diinput terlalu pendek (di bawah 9 digit), paksa pakai nomor standar
    const finalPhone = cleanPhone.length >= 9 ? cleanPhone : "081234567890";

    const uniqueOrderId = `PADEL-${bookingId}-${Date.now()}`;

    // Susun parameter menggunakan finalPhone
    const parameter = {
      transaction_details: {
        order_id: uniqueOrderId,
        gross_amount: Math.round(totalPrice),
      },
      customer_details: {
        first_name: userName || "Pelanggan Padelin",
        phone: finalPhone, // ⚡ Menggunakan nomor yang sudah aman
      },
      credit_card: {
        secure: true,
      },
    };

    console.log("[Checkout API] Mengirim parameter ke Midtrans Snap:", JSON.stringify(parameter));

    try {
      const transaction = await snap.createTransaction(parameter);
      console.log("[Checkout API] BERHASIL! Token didapat:", transaction.token);
      
      return NextResponse.json({ 
        token: transaction.token,
        redirect_url: transaction.redirect_url 
      });
    } catch (midtransError: any) {
      console.error("[Checkout API] Midtrans SDK Error Terjadi:", midtransError);
      return NextResponse.json({ 
        error: "Ditolak oleh Midtrans Gateway", 
        details: midtransError.message || JSON.stringify(midtransError)
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Checkout API] Fatal Server Error:", error);
    return NextResponse.json({ error: "Gagal memproses token", details: error.message }, { status: 500 });
  }
}