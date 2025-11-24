import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- DENNE LINJEN ER KRITISK!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NyeVenner",
  description: "Aktiviteter for alle",
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