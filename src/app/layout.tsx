import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Deliberately not Inter/Geist - see docs/DESIGN.md. Space Grotesk carries
// the app's visual personality in headings; Plex Sans/Mono share a
// designer with it so the pairing doesn't look like two unrelated fonts.
const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "500",
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const data = IBM_Plex_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "Waypoint",
  description: "Track the countries, US states, national parks, and UNESCO sites you've visited.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${data.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
