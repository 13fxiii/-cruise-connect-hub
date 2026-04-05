import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Cruise & Connect Hub — how we collect, use and protect your data.',
};

export default function PrivacyPage() {
  const lastUpdated = 'April 5, 2026';
  const appName    = 'Cruise & Connect Hub〽️';
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL || 'https://cruise-connect-hub.vercel.app';
  const contactX   = '@TheCruiseCH on X';
  const contactEmail = 'fxiiii@icloud.com';

  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        {
          sub: 'Account Information',
          body: 'When you create an account we collect your email address, display name, username, and profile photo. If you sign in with X (Twitter), we collect your X username, display name, and profile image.',
        },
        {
          sub: 'Usage Data',
          body: 'We collect information about how you use the app — pages visited, features used, games played, posts created, polls voted on, and time spent. This helps us improve the experience.',
        },
        {
          sub: 'Device & Technical Data',
          body: 'We automatically collect your device type, operating system, browser type, IP address, and crash reports to diagnose issues and keep the app running smoothly.',
        },
        {
          sub: 'Payment Information',
          body: 'Payments are processed by Flutterwave. We do not store your card details — only transaction references, amounts, and statuses are saved in our system.',
        },
        {
          sub: 'User Content',
          body: 'Posts, comments, poll responses, game scores, job applications, merch orders, and any other content you create on the platform.',
        },
      ],
    },
    {
      title: '2. How We Use Your Information',
      content: [
        {
          sub: 'To Provide the Service',
          body: 'Your data powers your account, feed, wallet, games, leaderboard, notifications, and all other features of CC Hub.',
        },
        {
          sub: 'To Personalise Your Experience',
          body: 'We use your activity to surface relevant content, suggest community members to connect with, and tailor your feed.',
        },
        {
          sub: 'To Communicate With You',
          body: 'We send you notifications about activity on your account, community announcements, and important service updates.',
        },
        {
          sub: 'To Improve CC Hub',
          body: 'Aggregated, anonymised usage data helps us understand what features are loved, what needs fixing, and where to invest next.',
        },
        {
          sub: 'To Ensure Safety',
          body: 'We use your data to detect and prevent fraud, abuse, spam, and violations of our community guidelines.',
        },
      ],
    },
    {
      title: '3. How We Share Your Information',
      content: [
        {
          sub: 'We Do Not Sell Your Data',
          body: 'CC Hub does not sell, rent, or trade your personal information to third parties for marketing purposes. Ever.',
        },
        {
          sub: 'Service Providers',
          body: 'We share data with trusted providers that help us operate: Supabase (database & auth), Vercel (hosting), Flutterwave (payments), and Anthropic (AI features). These providers are bound by strict data processing agreements.',
        },
        {
          sub: 'Public Profile',
          body: 'Your username, display name, profile photo, level, points, and posts you create are visible to other community members. You control what you share.',
        },
        {
          sub: 'Legal Requirements',
          body: 'We may disclose information if required by law, court order, or to protect the safety of our users and the public.',
        },
      ],
    },
    {
      title: '4. Data Storage & Security',
      content: [
        {
          sub: 'Where We Store Data',
          body: 'Your data is stored on Supabase infrastructure with servers located in the EU and US. All data is encrypted at rest and in transit using industry-standard TLS.',
        },
        {
          sub: 'Security Measures',
          body: 'We implement Row Level Security (RLS) policies, hashed authentication tokens, and regular security audits. However, no system is 100% secure — we encourage you to use a strong password.',
        },
        {
          sub: 'Data Retention',
          body: 'We retain your account data for as long as your account is active. If you delete your account, your personal data is removed within 30 days, except where retention is required by law.',
        },
      ],
    },
    {
      title: '5. Your Rights & Controls',
      content: [
        {
          sub: 'Access & Portability',
          body: 'You can request a copy of all data we hold about you by contacting us at @TheCruiseCH on X.',
        },
        {
          sub: 'Correction',
          body: 'You can update your profile information at any time from the profile settings page.',
        },
        {
          sub: 'Deletion',
          body: 'You can delete your account at any time from the settings page. This permanently removes your profile and content from CC Hub.',
        },
        {
          sub: 'Notifications',
          body: 'You can manage push notification preferences in your device settings or within the app.',
        },
        {
          sub: 'GDPR & NDPR',
          body: 'If you are in the EU or Nigeria, you have additional rights under GDPR and the Nigeria Data Protection Regulation (NDPR) including the right to object to processing and the right to lodge a complaint with a supervisory authority.',
        },
      ],
    },
    {
      title: '6. Cookies & Tracking',
      content: [
        {
          sub: 'Session Cookies',
          body: 'We use essential cookies to keep you logged in and maintain your session. These are strictly necessary and cannot be disabled.',
        },
        {
          sub: 'Analytics',
          body: 'We may use anonymised analytics to understand aggregate usage patterns. No personal identifiers are shared with analytics providers.',
        },
        {
          sub: 'No Ad Tracking',
          body: 'CC Hub does not use third-party advertising cookies or cross-site tracking technologies.',
        },
      ],
    },
    {
      title: '7. Children\'s Privacy',
      content: [
        {
          sub: 'Age Requirement',
          body: 'CC Hub is intended for users aged 13 and older (17+ for certain features). We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, contact us immediately.',
        },
      ],
    },
    {
      title: '8. Third-Party Links & Services',
      content: [
        {
          sub: 'External Links',
          body: 'CC Hub may contain links to external sites such as X (Twitter), YouTube, Spotify, and other platforms. We are not responsible for the privacy practices of those sites.',
        },
        {
          sub: 'X / Twitter Integration',
          body: 'If you use Sign In with X, your authentication is handled by X\'s OAuth 2.0 system. We only receive your public profile information (name, username, profile image). Review X\'s privacy policy at x.com/privacy.',
        },
      ],
    },
    {
      title: '9. Changes to This Policy',
      content: [
        {
          sub: 'Updates',
          body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via an in-app notification or announcement post. Continued use of CC Hub after changes means you accept the updated policy.',
        },
      ],
    },
    {
      title: '10. Contact Us',
      content: [
        {
          sub: 'Get in Touch',
          body: `If you have questions, concerns, or requests about this Privacy Policy or your data, email ${contactEmail} or reach us at ${contactX}. You can also contact us through the community at ${appUrl}.`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-yellow-400/30">
              <Image src="/logo.jpeg" alt="CC Hub" fill sizes="36px" className="object-cover" />
            </div>
            <span className="text-white font-black text-sm hidden sm:block">CC Hub〽️</span>
          </Link>
          <Link href="/"
            className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← Back to app
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Title block */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-yellow-400 text-xs font-bold">🔐 LEGAL</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p className="text-zinc-400 text-sm">
            <span className="text-yellow-400 font-semibold">{appName}</span>
            {' '}— Last updated {lastUpdated}
          </p>
          <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
            Your privacy matters to us. This policy explains what data we collect, why we collect it,
            and how we protect it. We keep it plain English — no legal jargon.
          </p>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { icon: '🚫', title: 'No Data Sales', desc: 'We never sell your personal data to anyone' },
            { icon: '🔐', title: 'Encrypted', desc: 'All data encrypted at rest and in transit' },
            { icon: '✂️', title: 'Delete Anytime', desc: 'Request full account deletion at any time' },
          ].map(c => (
            <div key={c.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-white font-bold text-sm">{c.title}</div>
              <div className="text-zinc-500 text-xs mt-1">{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map(section => (
            <div key={section.title} className="border-b border-zinc-900 pb-8 last:border-0">
              <h2 className="text-white font-black text-lg mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.content.map(item => (
                  <div key={item.sub}>
                    <h3 className="text-yellow-400 font-bold text-sm mb-1">{item.sub}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-zinc-400 text-sm mb-3">
            Questions about this policy?
          </p>
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
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Contact @TheCruiseCH
            </a>
          </div>
          <p className="text-zinc-600 text-xs mt-4">
            © 2026 Cruise & Connect Hub〽️ · All rights reserved
          </p>
        </div>
      </main>
    </div>
  );
}
