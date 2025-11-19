'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Disc3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="mb-8 group"
    >
      <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <Disc3
        className="h-6 w-6 text-primary animate-spin mr-2"
        style={{ animationDuration: '1.5s' }}
      />
      Back
    </Button>
  );
}
