import "./globals.css";
import type { Metadata } from "next";
import Nav from "./components/Nav";

export const metadata: Metadata = {
  title: "NeVo Tower",
  description: "A new development model built on partners, not investors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        margin: 0,
      }}>
        <Nav />
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
