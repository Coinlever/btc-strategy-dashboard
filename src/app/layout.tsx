import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTC Trend Following Strategy | Performance Dashboard",
  description:
    "Historical performance dashboard for a BTC trend following strategy on Binance BTCUSDT perpetual futures.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
