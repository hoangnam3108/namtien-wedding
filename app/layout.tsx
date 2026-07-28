import type { Metadata } from "next";
import { Playfair_Display, Lora, Great_Vibes } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-great-vibes" });

export const metadata: Metadata = {
  title: "The Wedding Of Nam & Tiên",
  description: "Trân trọng kính mời bạn đến tham dự lễ cưới của chúng tôi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${playfair.variable} ${lora.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-serif">
        {children}
      </body>
    </html>
  );
}