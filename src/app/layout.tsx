import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { CartProvider } from '@/context/cart-context';
import { RegionProvider } from '@/context/region-context';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Verse3 Records',
  description: 'Electronic music label, Streetwear merch & Live events',
  icons: {
    icon: [
      { url: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/favicon.ico?alt=media&token=23b7208f-24e8-4f3b-aab8-8bfd2ed9ca74' },
      { url: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/IMG-20260204-WA0001~2.jpg?alt=media&token=45b80a78-89ad-40ca-a55a-e185c9447432', sizes: '192x192', type: 'image/jpeg' },
    ],
    shortcut: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/favicon.ico?alt=media&token=23b7208f-24e8-4f3b-aab8-8bfd2ed9ca74',
    apple: [
      { url: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/IMG-20260204-WA0001~2.jpg?alt=media&token=45b80a78-89ad-40ca-a55a-e185c9447432', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;700&family=Staatliches&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <RegionProvider>
            <CartProvider>
              <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
                <Header />
                <main className="flex-1 w-full">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </RegionProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
