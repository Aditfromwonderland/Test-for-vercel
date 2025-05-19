import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Use the Inter font with Latin subset
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coffee-Chat Copilot',
  description: 'Get personalized networking advice tailored to your consulting coffee chats',
  keywords: 'consulting, coffee chat, networking, career advice, professional development',
  authors: [{ name: 'Coffee-Chat Copilot Team' }],
  openGraph: {
    title: 'Coffee-Chat Copilot',
    description: 'Personalized advice for consulting coffee chats',
    siteName: 'Coffee-Chat Copilot',
  },
  twitter: {
    title: 'Coffee-Chat Copilot',
    description: 'Personalized advice for consulting coffee chats',
  }
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
