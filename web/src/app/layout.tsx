import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "TanahKita — Pencatatan & Verifikasi Hak Penguasaan Tanah Adat Papua",
  description:
    "Sistem pencatatan bukti tanah ulayat masyarakat adat Papua berbasis integritas kriptografi SHA-256 dan hash-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen bg-stone-50 text-stone-900 antialiased selection:bg-amber-800 selection:text-white">
        <Navbar />
        <main id="konten-utama" className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
