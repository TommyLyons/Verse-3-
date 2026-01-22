import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { CartProvider } from '@/context/cart-context';
import { RegionProvider } from '@/context/region-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verse3 Records',
  description: 'Recording Studio, Music, and Merchandise.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <RegionProvider>
            <CartProvider>
              <div className="relative flex min-h-dvh flex-col bg-background">
                <Header />
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
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
