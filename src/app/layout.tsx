import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import AuthGate from '@/components/auth/AuthGate';
import { AuthProvider } from '@/context/AuthContext';
import { GiftCardProvider } from '@/context/GiftCardContext';
import BottomNav from '@/components/ui/BottomNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GiftKeep',
  description: 'Track your gift card balances',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GiftKeep',
  },
  icons: {
    icon: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-gray-50 font-sans antialiased">
        <AuthProvider>
          <AuthGate>
            <GiftCardProvider>
              <div className="max-w-md mx-auto min-h-svh flex flex-col pb-16">
                {children}
              </div>
              <BottomNav />
            </GiftCardProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
