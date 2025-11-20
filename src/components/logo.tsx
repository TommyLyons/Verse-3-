import Link from 'next/link';
import Image from 'next/image';
import { Disc3 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const headerLogo = PlaceHolderImages.find((img) => img.id === 'header-logo');

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      {headerLogo && (
        <Image
          src={headerLogo.imageUrl}
          alt={headerLogo.description}
          width={120}
          height={24}
          className="object-contain"
          priority
          data-ai-hint={headerLogo.imageHint}
        />
       )}
      <Disc3
        className="h-6 w-6 text-primary animate-spin"
        style={{ animationDuration: '3s' }}
      />
    </Link>
  );
}
