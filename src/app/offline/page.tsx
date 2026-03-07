import Image from "next/image";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden mb-6 ring-2 ring-yellow-400/30">
        <Image src="/logo.jpeg" alt="CC Hub" fill sizes="80px" className="object-cover" />
      </div>
      <h1 className="text-2xl font-black text-white mb-2">You&apos;re offline</h1>
      <p className="text-zinc-400 text-sm mb-6 max-w-xs">
        The bus is waiting for signal. Connect to the internet to keep cruising.
      </p>
      <div className="text-4xl mb-6">🚌💛</div>
      <Link href="/" className="bg-yellow-400 text-black font-black text-sm px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
        Try Again
      </Link>
    </div>
  );
}
