import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Frame Generator – Make Your Profile Picture Stand Out",
  description:
    "Generate professional profile picture frames in seconds. Perfect for LinkedIn, Facebook, job applications, and more.",
  keywords: [
    "profile frame generator",
    "profile picture editor",
    "profile design",
    "LinkedIn profile",
    "Facebook profile",
    "professional branding",
    "open to work",
    "personal branding tool",
  ],
  openGraph: {
    title: "Frame Generator – Make Your Profile Picture Stand Out",
    description:
      "Create stunning profile frames to showcase your personality and professionalism across platforms.",
    url: "https://framegenerator.net",
    siteName: "Frame Generator",
    images: [
      {
        url: "https://framegenerator.net/logo.png", // Սա պատրաստ պետք է լինի
        width: 1200,
        height: 630,
        alt: "Profile Frame Generator preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frame Generator – Make Your Profile Picture Stand Out",
    description:
      "Create stunning profile frames for LinkedIn, Facebook, and other platforms.",
    images: ["https://framegenerator.net/logo.png"],
  },
  metadataBase: new URL("https://framegenerator.net"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
