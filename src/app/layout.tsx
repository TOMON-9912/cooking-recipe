import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/presentation/components/Header";
import { APP_NAME, APP_TAGLINE } from "@/constants/app";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  description:
    "紙のメモや写真に散らばったレシピを、家族みんなで使える形にまとめる、家族専用のレシピ帳です",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="jp">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJP.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        <Header user={user} />
        <main className="flex-1 pt-16">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
