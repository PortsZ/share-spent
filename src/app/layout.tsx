import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { isClerkConfigured } from "../lib/env";
import { Geist, Geist_Mono } from "next/font/google";

import { AppProviders } from "./providers/app-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShareSpent",
  description: "Split receipts, reconcile payments, and stay audit-ready.",
  appleWebApp: { capable: true, title: "ShareSpent", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays available; viewportFit lets the shell paint into the notch.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tree = (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );

  // Without keys ClerkProvider throws on render, which would take the whole
  // site down. Unconfigured deployments still boot and serve the demo.
  return isClerkConfigured ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
