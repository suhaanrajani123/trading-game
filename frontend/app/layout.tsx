import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tradepath — Learn the Market with Fake Money",
  description: "A gamified stock market simulator using real prices and zero real risk.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} font-body bg-bg text-text min-h-screen`}>
        <Ticker />
        <div className="flex">
          <Nav />
          <main className="flex-1 min-h-[calc(100vh-40px)] px-6 py-8 md:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
