import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NyeVenner - Aktiviteter nær deg",
  description: "En møteplass for sosiale aktiviteter og nye vennskap.",
  icons: {
    icon: "https://fav.farm/🤝", // Dette er et triks for å få en emoji som ikon kjapt!
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className={inter.className}>{children}</body>
    </html>
  );
}