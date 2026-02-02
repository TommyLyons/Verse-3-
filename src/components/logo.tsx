'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Disc3 } from 'lucide-react';

const headerLogoUrl = "https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/85b09a95-3871-44e0-8207-aca37bf004cb%202.JPG?alt=media&token=71ef21d5-0b7b-43cb-bbf6-143b9e968ad2";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Disc3
        className="h-6 w-6 text-[#FFFF00] animate-spin"
        style={{ animationDuration: '3s' }}
      />
      <div className="relative h-10 w-32 filter brightness-110">
        <Image
          src={headerLogoUrl}
          alt="Verse3 Records Logo"
          fill
          className="object-contain"
          priority
          data-ai-hint="company logo"
        />
      </div>
      <Disc3
        className="h-6 w-6 text-[#FFFF00] animate-spin"
        style={{ animationDuration: '3s' }}
      />
    </Link>
  );
}
