import Link from 'next/link';
import { Music } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Music className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-bold text-foreground">
        Verse3 Records
      </span>
    </Link>
  );
}
