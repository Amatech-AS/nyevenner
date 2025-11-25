import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NyeVenner",
  description: "Relasjoner skapes hele livet. Finn aktiviteter i ditt nabolag.",
  manifest: "/manifest.json", // <-- Kobler til manifestet
  icons: {
    icon: "https://fav.farm/💚",
    apple: "/icon-192.png", // Ikon for iPhone
  },
};

// Dette styrer fargen på toppen av mobilen (status bar)
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Føles mer som en app når man ikke kan zoome ut ved uhell
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