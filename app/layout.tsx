import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NyeVenner - Relasjoner skapes hele livet",
  description: "Norges nye møteplass. Finn gåturer, kaffetreff og sosiale aktiviteter i ditt nabolag. Enkelt, trygt og gratis.",
  openGraph: {
    title: "NyeVenner - Relasjoner skapes hele livet",
    description: "Finn noen å finne på noe med. Se aktiviteter i nærheten av deg.",
    type: "website",
    locale: "nb_NO",
    siteName: "NyeVenner",
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
