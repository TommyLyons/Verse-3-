import Link from 'next/link';
import { Disc3 } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Disc3
        className="h-6 w-6 text-primary animate-spin"
        style={{ animationDuration: '3s' }}
      />
      <span className="font-headline text-xl font-bold text-foreground">
        Verse3 Records
      </span>
    </Link>
  );
}
