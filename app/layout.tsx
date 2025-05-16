import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Use the Inter font with Latin subset
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coffee-Chat Coach',
  description: 'Get personalized networking advice tailored to your background and challenges',
  keywords: 'networking, career advice, coffee chat, professional development',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
