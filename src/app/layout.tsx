import type { Metadata, Viewport } from "next";
import Script from "next/script";
import BottomNav from "@/components/layout/BottomNav";
import InstallBanner from "@/components/layout/InstallBanner";
import AuthProvider from "@/components/auth/AuthProvider";
import { SessionProvider } from "@/components/layout/SessionProvider";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://big-cruise-hub-m93cdn.v2.appdeploy.ai";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#EAB308" },
    { media: "(prefers-color-scheme: light)", color: "#EAB308" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "BIG CRUISE〽️", template: "%s · BCH〽️" },
  description: "BIG CRUISE〽️ — the home of Naija internet culture, community, Play, music, entertainment and community activities.",
  applicationName: "BCH〽️",
  keywords: ["BIG CRUISE", "BCH", "Naija community", "Nigerian culture", "BIG CRUISE community"],
  authors: [{ name: "BIG CRUISE〽️", url: appUrl }],
  creator: "@BCHub_",
  publisher: "BIG CRUISE〽️",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BCH〽️",
    startupImage: [{ url: "/icons/icon-512x512.png", media: "(device-width: 390px)" }],
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "BIG CRUISE〽️",
    description: "The home of BIG CRUISE community culture, Play, music and entertainment.",
    siteName: "BIG CRUISE〽️",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BIG CRUISE〽️" }],
    type: "website",
    locale: "en_NG",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@BCHub_",
    site: "@BCHub_",
    title: "BIG CRUISE〽️",
    description: "The home of BIG CRUISE community culture online.",
    images: ["/og-image.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#EAB308",
    "msapplication-TileImage": "/icons/icon-144x144.png",
    "msapplication-navbutton-color": "#EAB308",
    "msapplication-starturl": "/",
    "msapplication-tap-highlight": "no",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-navbutton-color" content="#EAB308" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden antialiased">
        <AuthProvider>
          <SessionProvider>
            <div className="min-h-screen flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}>
              <InstallBanner />
              {children}
            </div>
            <BottomNav />
          </SessionProvider>
        </AuthProvider>
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(r => console.log('BCH SW:', r.scope))
                .catch(() => {});
            });
          }
        `}</Script>
      </body>
    </html>
  );
}
