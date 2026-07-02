// app/layout.tsx
import { Unbounded } from "next/font/google"; 
import "./globals.css"; 
// 1. IMPORT SCRIPT COMPONENT DARI NEXT.JS
import Script from "next/script";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
});

export const metadata = {
  title: "Padelin Jimbaran Booking Sistem",
  description: "Aplikasi booking lapangan padel realtime di Jimbaran, Bali",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body 
        suppressHydrationWarning={true}
        className={`${unbounded.variable} font-sans antialiased bg-[#09090b] text-[#fafafa]`}
        style={{
          fontFamily: `var(--font-unbounded), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        }}
      >
        {children}

        {/* 2. SUNTIKKAN SCRIPT SNAP MIDTRANS SANDBOX DI SINI */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}