import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/header/header";

export const metadata: Metadata = {
  title: "Vladyslav Yuzevych | Full-stack Developer",
  description: "Portfolio of Vladyslav Yuzevych, a full-stack developer focused on backend systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
