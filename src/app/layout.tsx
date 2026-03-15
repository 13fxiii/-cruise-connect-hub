import type { Metadata, Viewport } from "next";
import Script from "next/script";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import InstallBanner from "@/components/layout/InstallBanner";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#EAB308" },
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
  metadataBase: new URL('https://cruise-connect-hub.vercel.app'),
  title: { default: "Cruise Connect Hub〽️", template: "%s · CC Hub" },
  description: "The home of Naija culture online. Live Spaces, Games, Music, Movies, Jobs & Wallet. 3,000+ members strong.",
  applicationName: "CC Hub",
  keywords: ["Naija community", "Cruise Connect", "live spaces", "Nigerian culture", "online community"],
  authors: [{ name: "Cruise Connect Hub", url: "https://cruise-connect-hub.vercel.app" }],
  creator: "@CCHub_",
  publisher: "Cruise Connect Hub",

  // PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CC Hub〽️",
    startupImage: [
      { url: "/icons/icon-512x512.png", media: "(device-width: 390px)" },
    ],
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.json",

  // Icons
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png",  sizes: "16x16",  type: "image/png" },
      { url: "/icons/icon-32x32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icons/icon-192x192.png",sizes: "192x192",type: "image/png" },
      { url: "/icons/icon-512x512.png",sizes: "512x512",type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png",  sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png",sizes: "152x152", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },

  // Social
  openGraph: {
    title: "Cruise Connect Hub〽️",
    description: "The home of Naija culture. Spaces · Games · Music · Movies · Wallet",
    siteName: "Cruise Connect Hub",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cruise Connect Hub" }],
    type: "website",
    locale: "en_NG",
    url: "https://cruise-connect-hub.netlify.app",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@CCHub_",
    site: "@CCHub_",
    title: "Cruise Connect Hub〽️",
    description: "The home of Naija culture online.",
    images: ["/og-image.png"],
  },

  // Windows / MS
  other: {
    "mobile-web-app-capable":    "yes",
    "msapplication-TileColor":   "#EAB308",
    "msapplication-TileImage":   "/icons/icon-144x144.png",
    "msapplication-navbutton-color": "#EAB308",
    "msapplication-starturl":    "/",
    "msapplication-tap-highlight": "no",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* iOS PWA meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        {/* Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Windows */}
        <meta name="msapplication-navbutton-color" content="#EAB308" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden antialiased">
        {/* Safe area wrapper */}
        <div
          className="min-h-screen flex flex-col"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingLeft: "env(safe-area-inset-left)",
            paddingRight: "env(safe-area-inset-right)",
          }}
        >
          {/* PWA install nudge (iOS/Android/Windows) */}
          <InstallBanner />
          {children}
        </div>
        {/* Mobile bottom tab bar */}
        <MobileBottomNav />
        {/* Service worker */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(r => console.log('CC Hub SW:', r.scope))
                .catch(() => {});
            });
          }
        `}</Script>
      </body>
    </html>
  );
}
