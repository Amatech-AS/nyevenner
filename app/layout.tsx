import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NyeVenner - Relasjoner skapes hele livet",
  description: "En møteplass for sosiale aktiviteter og nye vennskap.",
  icons: {
    // Bruker et grønt hjerte som ikon. Enkelt og symboliserer vennskap.
    icon: "https://fav.farm/💚", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className={`${inter.className} bg-slate-50 text-slate-800`}>{children}</body>
    </html>
  );
}