import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Cruise Connect Hub〽️ — rules and terms that govern use of the platform.',
};

export default function TermsPage() {
  const lastUpdated = 'April 5, 2026';
  const appName = 'Cruise Connect Hub〽️';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cruise-connect-hub.vercel.app';
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || `${appUrl}/privacy`;

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By creating an account or using Cruise & Connect Hub, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the app.',
    },
    {
      title: '2. Eligibility',
      content:
        'You must be at least 13 years old to use the platform. Certain features may require you to be 17+ or 18+ depending on your local laws and platform rules.',
    },
    {
      title: '3. Account Responsibilities',
      content:
        'You are responsible for your account credentials and all activity under your account. Keep your login details secure and notify us immediately if you suspect unauthorized access.',
    },
    {
      title: '4. Community Conduct',
      content:
        'No harassment, hate speech, scams, impersonation, or illegal content. Respect other members and follow moderator guidance. We may remove content or suspend accounts that violate these terms.',
    },
    {
      title: '5. User Content',
      content:
        'You keep ownership of content you post. By posting, you grant Cruise & Connect Hub a non-exclusive license to host, display, and distribute that content within the service to operate community features.',
    },
    {
      title: '6. Payments, Wallet & Refunds',
      content:
        'Payments are processed by third-party providers such as Flutterwave. We may limit, reverse, or block wallet actions where fraud, abuse, chargebacks, or legal risk is detected. Refund decisions are handled case-by-case where required by law.',
    },
    {
      title: '7. Third-Party Services',
      content:
        'The app may integrate with X (Twitter), Supabase, Vercel, and other providers. Your use of third-party services is also subject to their own terms and privacy policies.',
    },
    {
      title: '8. Termination',
      content:
        'We may suspend or terminate accounts that violate these terms, threaten user safety, or harm platform integrity. You may stop using the app at any time.',
    },
    {
      title: '9. Disclaimer & Limitation of Liability',
      content:
        'The service is provided “as is” without warranties of uninterrupted or error-free operation. To the fullest extent permitted by law, Cruise & Connect Hub is not liable for indirect, incidental, or consequential damages arising from platform use.',
    },
    {
      title: '10. Changes to These Terms',
      content:
        'We may update these terms from time to time. Material updates may be announced in-app. Continued use after changes become effective means you accept the revised terms.',
    },
    {
      title: '11. Contact',
      content:
        `Questions about these terms? Reach us via @TheCruiseCH on X or in-app at ${appUrl}.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-yellow-400/30">
              <Image src="/logo.jpeg" alt="CC Hub" fill sizes="36px" className="object-cover" />
            </div>
            <span className="text-white font-black text-sm hidden sm:block">Cruise Connect Hub〽️</span>
          </Link>
          <Link href="/" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Back to app
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-yellow-400 text-xs font-bold">📜 LEGAL</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Terms of Service</h1>
          <p className="text-zinc-400 text-sm">
            <span className="text-yellow-400 font-semibold">{appName}</span>
            {' '}— Last updated {lastUpdated}
          </p>
          <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
            These terms explain the rules for using our community app and services.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="border-b border-zinc-900 pb-8 last:border-0">
              <h2 className="text-white font-black text-lg mb-3">{section.title}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-zinc-400 text-sm mb-3">Read our privacy policy too.</p>
          <a
            href={privacyUrl}
            className="inline-flex items-center gap-2 bg-yellow-400 text-black font-black text-sm px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Open Privacy Policy
          </a>
          <p className="text-zinc-600 text-xs mt-4">
            © 2026 Cruise & Connect Hub〽️ · All rights reserved
          </p>
        </div>
      </main>
    </div>
  );
}
