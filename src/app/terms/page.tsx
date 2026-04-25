import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Cruise Connect Hub — rules, responsibilities, and platform terms.',
};

export default function TermsPage() {
  const lastUpdated = 'April 5, 2026';
  const appName = 'Cruise Connect Hub';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cruise-connect-hub.vercel.app';
  const contactEmail = 'CruiseConnectHub@gmail.com';
  const contactX = '@TheCruiseCH';

  const sections = [
    {
      title: '1. Acceptance of These Terms',
      content: [
        {
          sub: 'Agreement',
          body: `By accessing or using ${appName} (the “Service”), you agree to these Terms of Service (the “Terms”). If you do not agree, do not use the Service.`,
        },
        {
          sub: 'Privacy Policy',
          body: 'Your use of the Service is also governed by our Privacy Policy, which explains how we collect and use information.',
        },
      ],
    },
    {
      title: '2. Eligibility & Accounts',
      content: [
        {
          sub: 'Age Requirement',
          body: 'You must be at least 13 years old to use the Service. Some features may be intended for older audiences. If you are under the required age, do not use the Service.',
        },
        {
          sub: 'X (Twitter) Login',
          body: 'The Service uses Sign In with X for authentication. You are responsible for maintaining your X account and complying with X’s terms and policies.',
        },
        {
          sub: 'Accurate Information',
          body: 'You agree to provide accurate and current information and to keep your profile details up to date.',
        },
      ],
    },
    {
      title: '3. Community Conduct',
      content: [
        {
          sub: 'Be Respectful',
          body: 'No harassment, hate speech, discrimination, bullying, or targeted abuse. Treat people with respect.',
        },
        {
          sub: 'No Spam or Fraud',
          body: 'No spam, scams, impersonation, or attempts to manipulate engagement, payments, or community systems.',
        },
        {
          sub: 'No Explicit/Illegal Content',
          body: 'Do not post content that is sexually explicit, exploitative, violent, or otherwise illegal. Do not share others’ private information.',
        },
      ],
    },
    {
      title: '4. User Content',
      content: [
        {
          sub: 'Your Ownership',
          body: 'You retain ownership of the content you post (such as posts, comments, messages, and media).',
        },
        {
          sub: 'License to Operate the Service',
          body: 'You grant us a worldwide, non-exclusive, royalty-free license to host, store, reproduce, and display your content solely for operating and improving the Service.',
        },
        {
          sub: 'Responsibility',
          body: 'You are responsible for your content and represent that you have the rights to post it.',
        },
      ],
    },
    {
      title: '5. Moderation & Enforcement',
      content: [
        {
          sub: 'We Can Remove Content',
          body: 'We may remove content, restrict features, or suspend accounts that violate these Terms or harm the community.',
        },
        {
          sub: 'Safety',
          body: 'We may take action to prevent abuse, protect users, comply with legal obligations, and keep the Service safe.',
        },
      ],
    },
    {
      title: '6. Wallet & Payments',
      content: [
        {
          sub: 'Payment Processing',
          body: 'Deposits and withdrawals are processed via Flutterwave. We do not store your full card details; payment providers handle sensitive payment data.',
        },
        {
          sub: 'Transactions',
          body: 'Wallet balances and transaction history may be delayed due to provider verification, network issues, or fraud checks. We may reverse or block suspicious transactions.',
        },
        {
          sub: 'Fees & Limits',
          body: 'Transaction fees, minimum withdrawal amounts, and limits may apply and can change over time. You will see the applicable amounts in the app where possible.',
        },
      ],
    },
    {
      title: '7. Third-Party Services',
      content: [
        {
          sub: 'External Providers',
          body: 'The Service may rely on third-party services (such as Supabase, Vercel, Flutterwave, and X). Their terms and privacy policies may also apply.',
        },
        {
          sub: 'Links Outside the Service',
          body: 'If the Service links to external sites, we are not responsible for their content or policies.',
        },
      ],
    },
    {
      title: '8. Intellectual Property',
      content: [
        {
          sub: 'Our IP',
          body: `${appName} branding, logos, UI, and software are owned by us or our licensors. You may not copy, modify, or redistribute them without permission.`,
        },
      ],
    },
    {
      title: '9. Disclaimers',
      content: [
        {
          sub: 'As-Is Service',
          body: 'The Service is provided “as is” and “as available” without warranties of any kind. We do not guarantee uninterrupted, error-free operation.',
        },
      ],
    },
    {
      title: '10. Limitation of Liability',
      content: [
        {
          sub: 'Limits',
          body: 'To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data.',
        },
      ],
    },
    {
      title: '11. Termination',
      content: [
        {
          sub: 'Your Choice',
          body: 'You can stop using the Service at any time. If account deletion is available, you may request it through in-app options or by contacting us.',
        },
        {
          sub: 'Our Choice',
          body: 'We may suspend or terminate access if you violate these Terms or if we must do so for safety or legal reasons.',
        },
      ],
    },
    {
      title: '12. Changes to These Terms',
      content: [
        {
          sub: 'Updates',
          body: 'We may update these Terms from time to time. Continued use after updates means you accept the updated Terms.',
        },
      ],
    },
    {
      title: '13. Contact',
      content: [
        {
          sub: 'Get in Touch',
          body: `Questions about these Terms? Email ${contactEmail} or message ${contactX} on X. You can also visit the Service at ${appUrl}.`,
        },
      ],
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
            <span className="text-white font-black text-sm hidden sm:block">CC Hub</span>
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
            <span className="text-yellow-400 font-semibold">{appName}</span> — Last updated {lastUpdated}
          </p>
          <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
            These Terms explain how you can use the app, what you can post, how moderation works, and how payments are handled.
          </p>
          <div className="mt-4 text-zinc-400 text-sm">
            Related:{' '}
            <Link href="/privacy" className="text-yellow-400 hover:underline font-semibold">
              Privacy Policy
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { icon: '🤝', title: 'Respect', desc: 'Keep the community safe and welcoming' },
            { icon: '🧾', title: 'Your Content', desc: 'You own it, we host it to run the app' },
            { icon: '🛡️', title: 'Moderation', desc: 'We can remove content that breaks rules' },
          ].map((c) => (
            <div key={c.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-white font-bold text-sm">{c.title}</div>
              <div className="text-zinc-500 text-xs mt-1">{c.desc}</div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="border-b border-zinc-900 pb-8 last:border-0">
              <h2 className="text-white font-black text-lg mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.content.map((item) => (
                  <div key={item.sub}>
                    <h3 className="text-yellow-400 font-bold text-sm mb-1">{item.sub}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-zinc-400 text-sm mb-3">Need help or have questions?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black font-black text-sm px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors w-full sm:w-auto"
            >
              Email Support
            </a>
            <a
              href="https://x.com/TheCruiseCH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 text-white font-black text-sm px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors w-full sm:w-auto"
            >
              Message on X
            </a>
          </div>
          <p className="text-zinc-600 text-xs mt-4">© 2026 {appName} · All rights reserved</p>
        </div>
      </main>
    </div>
  );
}
