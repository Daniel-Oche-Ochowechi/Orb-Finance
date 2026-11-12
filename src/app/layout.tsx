import type { Metadata } from 'next';
import { Raleway, JetBrains_Mono } from 'next/font/google';
import StyledJsxRegistry from '@/lib/registry';
import './globals.css';

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Orb Finance — Every currency. One orbit.',
    template: '%s | Orb Finance',
  },
  applicationName: 'Orb Finance',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  },
  description:
    'Send your local currency to anyone, anywhere. They receive the equivalent in theirs. Orb Finance opens Q2 (15 April 2027). Request early access.',
  openGraph: {
    title: 'Orb Finance — Every currency. One orbit.',
    description:
      'Send your local currency to anyone, anywhere. They receive the equivalent in theirs. Orb Finance opens Q2 (15 April 2027). Request early access.',
    url: 'https://orbfinance.com',
    siteName: 'Orb Finance',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@OrbFinanceHq',
    creator: '@OrbFinanceHq',
    title: 'Orb Finance — Every currency. One orbit.',
    description:
      'Send your local currency to anyone, anywhere. They receive the equivalent in theirs. Orb Finance opens Q2 (15 April 2027).',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${raleway.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased selection-orb">
        {/* Fine film noise overlay for authentic tactile atmosphere */}
        <div className="tactile-noise" aria-hidden="true" />
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
      </body>
    </html>
  );
}

