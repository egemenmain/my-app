import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { tr } from "@/lib/i18n";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: tr.site.title,
  description: tr.site.description,
  keywords: "belediye, e-belediye, hizmet, vatandaş, online işlemler",
  authors: [{ name: "Birim Ajans Belediyesi" }],
  openGraph: {
    title: tr.site.title,
    description: tr.site.description,
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: tr.site.title,
    description: tr.site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-textPrimary">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
        <Script
          id="chat-init"
          src="https://app.dialogfusion.com/account/js/init.js?id=6505747"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
