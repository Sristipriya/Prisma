import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prisma — Shielded Financial Infrastructure | Midnight Network",
  description: "Next-gen zero-knowledge payroll streaming and vendor invoice settlements on the Midnight Network.",
  icons: {
    icon: "/favicon.svg",
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="video" href="/hero.mp4" />
      </head>
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </WalletProvider>
      </body>
    </html>
  );
}
