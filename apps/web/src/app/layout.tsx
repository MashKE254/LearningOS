import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'EduForge - AI-Powered Adaptive Learning',
  description: 'Transform any curriculum into personalized, Socratic pedagogy with EduForge.',
  keywords: ['education', 'AI tutor', 'personalized learning', 'adaptive learning'],
  authors: [{ name: 'Forge.AI' }],
  openGraph: {
    title: 'EduForge - AI-Powered Adaptive Learning',
    description: 'Transform any curriculum into personalized, Socratic pedagogy.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
