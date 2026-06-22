// app/layout.tsx
import { Unbounded } from "next/font/google"; 
import "./globals.css"; // Sesuaikan dengan path CSS utama kamu

// 2. DEFINISIKAN VARIABEL FONT DI SINI
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
      </body>
    </html>
  );
}