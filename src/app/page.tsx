'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Disc, Eye } from 'lucide-react';
import { getAllProducts, type Product } from '@/lib/products';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from '@/components/ui/skeleton';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const hotDrop = { id: 5, title: 'Midnight Drive', artist: 'DJ Lofty', videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/WhatsApp%20Video%202025-11-19%20at%2018.19.29.mp4?alt=media&token=fdad85e4-48e2-4911-b762-ce1a44bcd192' };

const instagramImages = [
  getImage('hero-studio'),
  getImage('album-art-2'),
  getImage('merch-hoodie'),
  getImage('artist-lofty'),
  getImage('artist-keith'),
  getImage('artist-alvin'),
  getImage('merch-cap'),
  getImage('merch-vinyl')
].filter(Boolean) as typeof PlaceHolderImages;

export default function Home() {
  const [isHotDropOpen, setIsHotDropOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasSeenHotDrop = localStorage.getItem('hotDropShown');
    if (!hasSeenHotDrop) {
      const timer = setTimeout(() => {
        setIsHotDropOpen(true);
        localStorage.setItem('hotDropShown', 'true');
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    async function fetchProducts() {
        setIsLoading(true);
        const products = await getAllProducts();
        setAllProducts(products);
        setIsLoading(false);
    }
    fetchProducts();
  }, []);
  
  const merchProducts = allProducts.filter(p => p.type === 'merch').slice(0, 4);
  const musicProducts = allProducts.filter(p => p.type === 'music' && !p.digital).slice(0, 4);

  return (
    <div className="flex flex-col">
      <Dialog open={isHotDropOpen} onOpenChange={setIsHotDropOpen}>
        <DialogContent className="max-w-xs bg-card border-primary/50">
          <DialogHeader>
            <DialogTitle className='font-headline text-3xl font-bold tracking-tight text-primary'>Hot Drop</DialogTitle>
            <DialogDescription>Check out the latest exclusive track.</DialogDescription>
          </DialogHeader>
          <div className="w-full">
            <Card className="overflow-hidden border-none shadow-none">
                <CardContent className="p-0">
                    <video src={hotDrop.videoSrc} controls className="w-full h-full object-cover" />
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{hotDrop.title}</p>
                        <p className="text-sm text-muted-foreground">{hotDrop.artist}</p>
                    </div>
                    <Disc className="h-6 w-6 text-primary" />
                </CardFooter>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section - Restored original placement */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <video
          src="https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/WhatsApp%20Video%202025-11-19%20at%2018.15.08.mp4?alt=media&token=c2aaa55b-f264-4ef6-a86c-13e63d82cb85"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 flex flex-wrap justify-center gap-4 px-4">
          <Button size="lg" asChild className="bg-black text-chart-1 hover:bg-black/90 font-bold min-w-[140px] border-none">
            <Link href="/store">Shop Merch</Link>
          </Button>
          <Button size="lg" asChild className="bg-black text-chart-1 hover:bg-black/90 font-bold min-w-[140px] border-none">
            <Link href="/music">Explore Music</Link>
          </Button>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 md:py-24 bg-white border-y">
          <div className="container max-w-4xl text-center">
              <h2 className="font-headline text-3xl font-bold text-black sm:text-4xl uppercase tracking-wider">Our Vision</h2>
              <p className="mt-6 text-muted-foreground md:text-lg leading-relaxed">
                  Our mission is to champion emerging talent and deliver emotionally powerful records that resonate. We believe that music is most powerful when crafted from real stories, and we are committed to fostering a community where artists can be vulnerable and authentic.
              </p>
          </div>
      </section>

       {/* Featured Merch */}
       <section className="py-16 md:py-24">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold text-black sm:text-4xl uppercase tracking-wider">Featured Merch</h2>
                    <p className="mt-2 text-muted-foreground">Rep the label with our latest gear.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {isLoading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />) :
                        merchProducts.map((item) => (
                            <Card key={item.id} className="overflow-hidden group flex flex-col border-none shadow-none">
                                <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative bg-secondary rounded-lg overflow-hidden">
                                    <Image
                                        src={item.imageUrl || ''}
                                        alt={item.name}
                                        fill
                                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                </Link>
                                <div className="mt-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-black uppercase">{item.name}</p>
                                        <p className="text-sm font-medium">{item.price}</p>
                                    </div>
                                    <Button size="sm" asChild variant="secondary" className="bg-black text-chart-1 hover:bg-black/90">
                                        <Link href={`/store/${item.type}/${item.slug}`}><Eye className="h-4 w-4"/></Link>
                                    </Button>
                                </div>
                            </Card>
                        ))
                    }
                </div>
                <div className="text-center mt-12">
                    <Button asChild size="lg" className="bg-black text-chart-1 font-bold">
                        <Link href="/store">View All Merch</Link>
                    </Button>
                </div>
            </div>
       </section>

       {/* Latest Music */}
       <section className="py-16 md:py-24 bg-secondary">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold text-black sm:text-4xl uppercase tracking-wider">Latest Music</h2>
                    <p className="mt-2 text-muted-foreground">Vinyl, posters, and more from our artists.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {isLoading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />) :
                        musicProducts.map((item) => (
                            <Card key={item.id} className="overflow-hidden group flex flex-col border-none shadow-none bg-transparent">
                                <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative rounded-lg overflow-hidden bg-white shadow-sm">
                                    <Image
                                        src={item.imageUrl || ''}
                                        alt={item.name}
                                        fill
                                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                </Link>
                                <div className="mt-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-black uppercase">{item.name}</p>
                                        <p className="text-sm font-medium">{item.price}</p>
                                    </div>
                                    <Button size="sm" asChild variant="secondary" className="bg-black text-chart-1 hover:bg-black/90">
                                        <Link href={`/store/${item.type}/${item.slug}`}><Eye className="h-4 w-4"/></Link>
                                    </Button>
                                </div>
                            </Card>
                        ))
                    }
                </div>
                <div className="text-center mt-12">
                    <Button asChild size="lg" className="bg-black text-chart-1 font-bold">
                        <Link href="/store/music">View All Music</Link>
                    </Button>
                </div>
            </div>
       </section>

       {/* Instagram Feed */}
       <section className="py-16 md:py-24">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
                <h2 className="font-headline text-3xl font-bold text-black sm:text-4xl md:text-5xl uppercase tracking-wider">Instagram</h2>
                <p className="mt-2 text-muted-foreground">Get a behind-the-scenes look @verse3records</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {instagramImages.map((image) => (
                    <Link href="https://www.instagram.com/verse3records" key={image.id} target="_blank" rel="noopener noreferrer" className="block aspect-square relative rounded-md overflow-hidden bg-secondary">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover transition-all duration-500 hover:scale-110"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    </Link>
                ))}
            </div>
          </div>
       </section>
    </div>
  );
}