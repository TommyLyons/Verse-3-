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

const ICON_URL = 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/IMG-20260205-WA0003.jpg?alt=media&token=98291edc-2261-4cf8-9892-a10f7b00f8b0';

export const metadata: Metadata = {
  title: 'Verse3 Records',
  description: 'Electronic music label, Streetwear merch & Live events',
  icons: {
    icon: [
      { url: ICON_URL, type: 'image/jpeg' },
    ],
    shortcut: ICON_URL,
    apple: [
      { url: ICON_URL, sizes: '180x180', type: 'image/jpeg' },
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
        {/* Force favicon updates with a direct link and type */}
        <link rel="icon" type="image/jpeg" href={`${ICON_URL}&v=1`} />
        <link rel="apple-touch-icon" href={ICON_URL} />
        <link rel="shortcut icon" href={ICON_URL} />
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
