import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cruise & Connect Hub〽️",
  description: "Where Community Meets Culture. Connect. Chat. Earn.",
  openGraph: {
    title: "Cruise & Connect Hub〽️",
    description: "Spaces · Games · Music · Movies · Giveaways",
    siteName: "C&C Hub",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@CCHub_",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
