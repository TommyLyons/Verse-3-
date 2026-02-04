'use client';

import Link from 'next/link';
import Image from 'next/image';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/IMG-20260204-WA0001~2.jpg?alt=media&token=7ffc7bdb-67bd-4011-a0dc-b7aab17f908e";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group">
      <div className="relative h-16 w-52 sm:h-18 sm:w-64 transition-opacity group-hover:opacity-90">
        <Image
          src={LOGO_URL}
          alt="Verse3 Records Logo"
          fill
          className="object-contain"
          priority
          data-ai-hint="company logo"
          sizes="(max-width: 640px) 208px, 256px"
        />
      </div>
    </Link>
  );
}
