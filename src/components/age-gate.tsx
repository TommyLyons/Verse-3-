
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AgeGateProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AgeGate({ isOpen, onConfirm, onCancel }: AgeGateProps) {
  const explicitImage = PlaceHolderImages.find(img => img.id === 'explicit-gate');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-md bg-black border-chart-1 text-white">
        <DialogHeader className="items-center text-center">
          <div className="relative w-48 h-48 mb-4">
            {explicitImage && (
              <Image
                src={explicitImage.imageUrl}
                alt="Explicit Content Warning"
                fill
                className="object-contain"
                priority
              />
            )}
          </div>
          <DialogTitle className="font-headline text-3xl text-chart-1 uppercase italic">
            Age Verification Required
          </DialogTitle>
          <DialogDescription className="text-white/70">
            You are about to access the Crude City collection. This content is intended for audiences aged 18 and over.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={onConfirm}
            className="bg-chart-1 text-black hover:bg-white font-bold h-12 uppercase italic"
          >
            I am 18 or older
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-white hover:text-chart-1 font-bold h-12 uppercase italic border border-white/20"
          >
            Go Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
