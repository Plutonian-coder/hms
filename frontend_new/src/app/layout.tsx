import type { Metadata } from "next";
import { Syne, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YABATECH HMS | HOSTEL MANAGEMENT",
  description: "YABATECH Hostel Management System - Student accommodation management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground relative overflow-x-hidden`}>
        <div className="noise-overlay fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay"></div>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "#F4F4F0",
              border: "2px solid #000",
              borderRadius: "0px",
              fontFamily: "var(--font-outfit)",
            },
            className: "brutalist-toast",
          }}
        />
      </body>
    </html>
  );
}
