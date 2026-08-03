import type { Metadata } from "next";
import "./globals.css";

const deployedHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const metadataBase = new URL(deployedHost ? `https://${deployedHost}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Liberty Legacy Bank — Inheritance Banking",
  description: "A non-operational inheritance banking prototype with account reporting, transactions, documents, and customer-care messaging.",
  openGraph: {
    title: "Liberty Legacy Bank — Inheritance Banking",
    description: "A calm, clear inheritance banking prototype.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Liberty Legacy Bank non-operational inheritance banking prototype" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Liberty Legacy Bank — Inheritance Banking",
    description: "A calm, clear inheritance banking prototype.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
