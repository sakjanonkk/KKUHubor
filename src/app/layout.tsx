import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";
import { BookmarkProvider } from "@/contexts/bookmark-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KKUHubor - Course Reviews",
  description:
    "Find reviews, share experiences, and survive your semester at KKU",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BookmarkProvider>
          <Navbar isAdmin={!!(await cookies()).get("admin_session")} />
          {children}
          <Toaster />
        </BookmarkProvider>
      </body>
    </html>
  );
}
