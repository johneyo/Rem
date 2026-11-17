import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SideNav, TabBar } from "@/components/nav";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Rem",
  description: "Remember the people who matter, automatically.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#1f4d3f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <div className="mx-auto flex max-w-6xl">
          <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 px-4 py-6 md:flex">
            <Link href="/" className="px-3">
              <Logo />
            </Link>
            <SideNav />
          </aside>
          <div className="min-w-0 flex-1">
            <header className="flex items-center justify-between px-4 pt-5 md:hidden">
              <Link href="/">
                <Logo />
              </Link>
            </header>
            <main className="px-4 pt-5 pb-28 md:px-8 md:pt-8 md:pb-12">{children}</main>
          </div>
        </div>
        <TabBar />
      </body>
    </html>
  );
}
