import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MockatorProvider } from "@/providers/mockator-provider";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mockator - AI Mock Data Generator",
  description:
    "Generate structured mock data using AI with natural language or TypeScript schemas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-zinc-950 text-white font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <MockatorProvider>{children}</MockatorProvider>
      </body>
    </html>
  );
}
