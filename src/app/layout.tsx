import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import ServiceWorkerRegister from "./sw-register";

export const metadata: Metadata = {
  title: "IdiomaLearn – Speak English with Confidence",
  description: "AI-powered spoken English coaching. Practice real conversations in your professional domain. CEFR-aligned, gamified, and personalized.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "IdiomaLearn – Speak English with Confidence",
    description: "AI-powered spoken English coaching for professionals",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#6C5CE7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-dark text-text-primary font-sans antialiased min-h-screen">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
