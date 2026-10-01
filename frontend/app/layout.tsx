import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CareerPilot AI — AI-Powered Career Platform',
  description:
    'Create ATS-friendly resumes, analyze job descriptions, optimize your professional profile, discover jobs worldwide, and manage applications — all in one AI-powered platform.',
  openGraph: {
    title: 'CareerPilot AI',
    description: 'AI-powered career platform for job seekers',
    type: 'website',
  },
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('cp-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
