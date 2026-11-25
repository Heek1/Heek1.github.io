import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/navigation/SiteHeader";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const text = Figtree({ subsets: ["latin"], variable: "--font-text", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const title = "Vladyslav Yuzevych | Full-stack Developer";
const description =
  "Full-stack developer with a backend focus: ASP.NET Core, Node.js, React and Angular, with AI built into real backend systems.";

export const metadata: Metadata = {
  metadataBase: new URL("https://heek1.github.io"),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Vladyslav Yuzevych",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
