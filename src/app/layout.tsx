import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { auth } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en" className="dark">
      <body className={`bg-cch-black text-white min-h-screen`}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
