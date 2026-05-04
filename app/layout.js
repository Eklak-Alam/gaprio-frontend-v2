import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/global/Navbar";
import AuthGuard from "@/components/global/AuthGuard";

// 1. Optimize Font Loading
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Prevents invisible text while font loads
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

// 2. PREMIUM SEO METADATA
export const metadata = {
  metadataBase: new URL('https://gaprio.com'), // TODO: Change to your actual production URL
  title: {
    default: "Gaprio | Build Your Digital Empire",
    template: "%s | Gaprio" // Automatically makes subpages look like: "Dashboard | Gaprio"
  },
  description: "Gaprio is the ultimate SaaS platform for full-stack architecture, seamless UI/UX, and enterprise-grade system design.",
  applicationName: "Gaprio",
  keywords: ["SaaS", "System Design", "UI/UX", "Full-Stack", "Web Development", "AI"],
  
  // OpenGraph (How your link looks on Discord, LinkedIn, iMessage)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gaprio.com",
    siteName: "Gaprio",
    title: "Gaprio | Build Your Digital Empire",
    description: "The ultimate SaaS platform for full-stack architecture and enterprise-grade system design.",
    images: [
      {
        url: "/og-image.jpg", // TODO: Put a cool 1200x630 image in your /public folder!
        width: 1200,
        height: 630,
        alt: "Gaprio SaaS Preview",
      },
    ],
  },
  
  // Twitter / X Cards
  twitter: {
    card: "summary_large_image",
    title: "Gaprio | Build Your Digital Empire",
    description: "The ultimate SaaS platform for full-stack architecture.",
    images: ["/og-image.jpg"],
  },
  
  // SEO Crawler Instructions
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// 3. VIEWPORT & DEVICE OPTIMIZATION
export const viewport = {
  themeColor: "#050505", // Matches your dark mode background so the browser tab turns black!
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // CRITICAL: Prevents iOS Safari from annoyingly zooming in when clicking inputs
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      // Added 'dark' class by default, and suppressHydrationWarning for when you add dark mode plugins later
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-[#FC8B32] selection:text-white">
        <AuthGuard>

        {children}
        </AuthGuard>
      </body>
    </html>
  );
}