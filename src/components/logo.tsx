
'use client';

import Link from 'next/link';
import Image from 'next/image';

const HEADER_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/IMG-20260204-WA0001~2.jpg?alt=media&token=45b80a78-89ad-40ca-a55a-e185c9447432";
const FOOTER_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/Verse3.jpeg?alt=media&token=7420284c-1e5d-46f7-9aa6-ad77fed151f4";

interface LogoProps {
  variant?: 'header' | 'footer';
}

export function Logo({ variant = 'header' }: LogoProps) {
  const url = variant === 'footer' ? FOOTER_LOGO_URL : HEADER_LOGO_URL;
  
  // Adjusted dimensions to ensure both look professional and aren't cut off
  const containerClasses = variant === 'footer' 
    ? "h-16 w-48 sm:h-20 sm:w-64" // Footer logo can be slightly more prominent
    : "h-12 w-40 sm:h-14 sm:w-48"; // Header logo size refined for balance

  return (
    <Link href="/" className="flex items-center group">
      <div className={`relative ${containerClasses} transition-opacity group-hover:opacity-90`}>
        <Image
          src={url}
          alt="Verse3 Records Logo"
          fill
          className="object-contain"
          priority={variant === 'header'}
          data-ai-hint="company logo"
          sizes="(max-width: 640px) 200px, 300px"
        />
      </div>
    </Link>
  );
}
