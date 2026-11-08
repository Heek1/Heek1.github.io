import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/navigation/SiteHeader";

const title = "Vladyslav Yuzevych | Full-stack Developer";
const description = "Portfolio of Vladyslav Yuzevych, a full-stack developer focused on backend systems.";

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
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
