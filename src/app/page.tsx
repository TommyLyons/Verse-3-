
'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Disc, Eye, ChevronRight, Instagram } from 'lucide-react';
import { getAllProducts, type Product } from '@/lib/products';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const hotDrop = { id: 5, title: 'Midnight Drive', artist: 'DJ Lofty', videoSrc: 'https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/WhatsApp%20Video%202025-11-19%20at%2018.19.29.mp4?alt=media&token=fdad85e4-48e2-4911-b762-ce1a44bcd192' };

const INSTAGRAM_URL = "https://www.instagram.com/verse3records?igsh=NXhzcW84N2NwZ3Iw";

// Curated selection using actual brand assets for the Instagram feed
const instagramImages = [
  getImage('who-are-the-3-hero'), // Actual Founders Image
  getImage('footer-logo'),       // Actual Branding Asset
  getImage('header-logo'),       // Actual Branding Asset
  getImage('album-art-2'),      // Thematic stock
  getImage('hero-studio'),       // Thematic stock
  getImage('merch-hoodie'),     // Thematic stock
  getImage('artist-lofty'),     // Thematic stock
  getImage('merch-vinyl')       // Thematic stock
].filter(Boolean);

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
  
  const merchProducts = allProducts.filter(p => p.type === 'merch').slice(0, 8);
  const musicProducts = allProducts.filter(p => p.type === 'music' && !p.digital).slice(0, 8);

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

      {/* Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <video
            src="https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/WhatsApp%20Video%202025-11-19%20at%2018.15.08.mp4?alt=media&token=c2aaa55b-f264-4ef6-a86c-13e63d82cb85"
            autoPlay loop muted playsInline
            className="w-full h-full object-contain mix-blend-multiply scale-150 md:scale-100"
          />
        </div>
        
        <div className="absolute bottom-10 md:bottom-12 z-10 flex flex-row justify-center gap-4 px-6 w-full max-w-md mx-auto">
          <Button asChild className="flex-1 bg-black text-chart-1 hover:bg-black/90 font-bold border-none shadow-xl h-12">
            <Link href="/store">Shop Merch</Link>
          </Button>
          <Button asChild className="flex-1 bg-black text-chart-1 hover:bg-black/90 font-bold border-none shadow-xl h-12">
            <Link href="/music">Music</Link>
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

       {/* Featured Merch Carousel */}
       <section className="py-16 md:py-24 bg-white">
            <div className="container overflow-hidden">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold text-black sm:text-4xl uppercase tracking-wider">Featured Merch</h2>
                    <p className="mt-2 text-muted-foreground">Rep the label with our latest gear.</p>
                </div>
                
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                    </div>
                ) : (
                    <div className="relative">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {merchProducts.map((item) => (
                                    <CarouselItem key={item.id} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/4">
                                        <Card className="overflow-hidden group flex flex-col border-none shadow-none bg-transparent">
                                            <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative bg-secondary rounded-lg overflow-hidden">
                                                <Image
                                                    src={item.imageUrl || ''}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                />
                                            </Link>
                                            <div className="mt-4 flex justify-between items-center px-1">
                                                <div>
                                                    <p className="font-bold text-black uppercase">{item.name}</p>
                                                    <p className="text-sm font-medium">{item.price}</p>
                                                </div>
                                                <Button size="sm" asChild variant="secondary" className="bg-black text-chart-1 hover:bg-black/90">
                                                    <Link href={`/store/${item.type}/${item.slug}`}><Eye className="h-4 w-4"/></Link>
                                                </Button>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="hidden lg:block">
                                <CarouselPrevious className="-left-12" />
                                <CarouselNext className="-right-12" />
                            </div>
                        </Carousel>
                        
                        <div className="flex lg:hidden items-center justify-center mt-8 gap-2 text-black font-bold animate-pulse">
                          <span className="text-[10px] uppercase tracking-[0.2em]">Swipe to explore</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                    </div>
                )}

                <div className="text-center mt-12">
                    <Button asChild size="lg" className="bg-black text-chart-1 font-bold">
                        <Link href="/store">View All Merch</Link>
                    </Button>
                </div>
            </div>
       </section>

       {/* Latest Music Carousel */}
       <section className="py-16 md:py-24 bg-secondary">
            <div className="container overflow-hidden">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl font-bold text-black sm:text-4xl uppercase tracking-wider">Latest Music</h2>
                    <p className="mt-2 text-muted-foreground">Vinyl, posters, and more from our artists.</p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                    </div>
                ) : (
                    <div className="relative">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {musicProducts.map((item) => (
                                    <CarouselItem key={item.id} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/4">
                                        <Card className="overflow-hidden group flex flex-col border-none shadow-none bg-transparent">
                                            <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative rounded-lg overflow-hidden bg-white shadow-sm">
                                                <Image
                                                    src={item.imageUrl || ''}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                />
                                            </Link>
                                            <div className="mt-4 flex justify-between items-center px-1">
                                                <div>
                                                    <p className="font-bold text-black uppercase">{item.name}</p>
                                                    <p className="text-sm font-medium">{item.price}</p>
                                                </div>
                                                <Button size="sm" asChild variant="secondary" className="bg-black text-chart-1 hover:bg-black/90">
                                                    <Link href={`/store/${item.type}/${item.slug}`}><Eye className="h-4 w-4"/></Link>
                                                </Button>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="hidden lg:block">
                                <CarouselPrevious className="-left-12" />
                                <CarouselNext className="-right-12" />
                            </div>
                        </Carousel>
                        
                        <div className="flex lg:hidden items-center justify-center mt-8 gap-2 text-black font-bold animate-pulse">
                          <span className="text-[10px] uppercase tracking-[0.2em]">Swipe to explore</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                    </div>
                )}

                <div className="text-center mt-12">
                    <Button asChild size="lg" className="bg-black text-chart-1 font-bold">
                        <Link href="/store/music">View All Music</Link>
                    </Button>
                </div>
            </div>
       </section>

       {/* Instagram Feed */}
       <section className="py-16 md:py-24 bg-white">
          <div className="container max-w-5xl">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Instagram className="h-6 w-6 text-black" />
                    <h2 className="font-headline text-3xl font-bold text-black sm:text-4xl md:text-5xl uppercase tracking-wider">Instagram</h2>
                </div>
                <p className="mt-2 text-muted-foreground">Follow our journey <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline">@verse3records</a></p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(instagramImages as any[]).map((image) => (
                    <Link href={INSTAGRAM_URL} key={image.id} target="_blank" rel="noopener noreferrer" className="block aspect-square relative rounded-md overflow-hidden bg-secondary group">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover transition-all duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Instagram className="text-white h-8 w-8" />
                        </div>
                    </Link>
                ))}
            </div>
            <div className="text-center mt-12">
                <Button asChild variant="outline" size="lg" className="border-black text-black font-bold hover:bg-black hover:text-white">
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Follow Us on Instagram</a>
                </Button>
            </div>
          </div>
       </section>
    </div>
  );
}
