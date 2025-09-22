import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileNav from "@/components/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Maestro - AI-Powered Macro Tracker",
  description: "Track your macronutrients with AI-powered food recognition, barcode scanning, and nutrition facts OCR",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 min-h-screen">
        <div className="flex flex-col min-h-screen">
          {/* Main content area */}
          <main className="flex-1 pb-20">
            {children}
          </main>

          {/* Mobile navigation */}
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
