import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartBudget",
  description: "Personal budget dashboard built with Next.js and Turso",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={cn("min-h-screen bg-slate-950 text-slate-50 antialiased", inter.className)}>
        {children}
      </body>
    </html>
  );
}
