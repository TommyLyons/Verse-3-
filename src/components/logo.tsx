
'use client';

import Link from 'next/link';
import Image from 'next/image';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/Verse3.jpeg?alt=media&token=7420284c-1e5d-46f7-9aa6-ad77fed151f4";

export function Logo() {
  return (
    <Link href="/" className="flex items-center group">
      <div className="relative h-14 w-40 sm:h-16 sm:w-52 transition-opacity group-hover:opacity-90 rounded-xl overflow-hidden shadow-md">
        <Image
          src={LOGO_URL}
          alt="Verse3 Records Logo"
          fill
          className="object-contain"
          priority
          data-ai-hint="company logo"
          sizes="(max-width: 640px) 160px, 208px"
        />
      </div>
    </Link>
  );
}
