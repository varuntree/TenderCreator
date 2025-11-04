import './globals.css';

import type { Metadata } from 'next';

import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { StyleGlideProvider } from '@/components/styleglide-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    default: 'TenderCreator - AI-Powered Tender Response Automation',
    template: '%s | TenderCreator',
  },
  description:
    'AI-powered tender response automation for Australian businesses. Reduce preparation time by 70% with intelligent RFT analysis, compliance tracking, and professional document generation.',
  keywords: [
    'Tender Response',
    'RFT Analysis',
    'AI Automation',
    'Australian Tenders',
    'Government Procurement',
    'Compliance Tracking',
    'Tender Management',
    'Proposal Automation',
  ],
  authors: [{ name: 'TenderCreator' }],
  creator: 'TenderCreator',
  publisher: 'TenderCreator',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: [{ url: '/favicon/favicon.ico' }],
  },
  openGraph: {
    title: 'TenderCreator - AI-Powered Tender Response Automation',
    description:
      'Reduce tender preparation time by 70% with AI-powered automation. Australian-hosted platform for intelligent RFT analysis and compliant tender responses.',
    siteName: 'TenderCreator',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TenderCreator - AI-Powered Tender Response Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TenderCreator - AI-Powered Tender Response Automation',
    description:
      'Reduce tender preparation time by 70% with AI-powered automation for Australian businesses.',
    images: ['/images/og-image.jpg'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'flex min-h-screen flex-col antialiased [--header-height:calc(var(--spacing)*14)] lg:[--header-height:calc(var(--spacing)*23)]',
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <StyleGlideProvider />

          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
