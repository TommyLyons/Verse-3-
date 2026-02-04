import { Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export function Footer() {
  const INSTAGRAM_URL = "https://www.instagram.com/verse3records?igsh=NXhzcW84N2NwZ3Iw";

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Logo variant="footer" />
            <p className="text-sm text-muted-foreground">
              Championing emotionally driven, forward-thinking electronic music.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <h3 className="font-semibold font-headline text-foreground">Quick Links</h3>
            <Link href="/store" className="text-sm text-muted-foreground hover:text-primary">
              Store
            </Link>
            <Link href="/music" className="text-sm text-muted-foreground hover:text-primary">
              Music
            </Link>
            <Link href="/submit-music" className="text-sm text-muted-foreground hover:text-primary">
              Submit Music
            </Link>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-end">
            <h3 className="font-semibold font-headline text-foreground">Follow Us</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Verse3 Records. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
