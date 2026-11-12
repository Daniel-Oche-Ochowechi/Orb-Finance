import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console',
  description: 'Orb Finance operational waitlist and institutional inquiries console.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

