
'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, ChevronRight, Instagram, Send, ShoppingBag } from 'lucide-react';
import { getAllProducts, type Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { AgeGate } from '@/components/age-gate';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const INSTAGRAM_URL = "https://www.instagram.com/verse3records?igsh=NXhzcW84N2NwZ3Iw";

export default function Home() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingBrand, setPendingBrand] = useState<string | null>(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem('v3_age_verified') === 'true';
    setIsAgeVerified(verified);

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

  const handleProductClick = (product: Product) => {
    if (product.brand === 'Crude City' && !isAgeVerified) {
      setPendingProduct(product);
      setIsAgeGateOpen(true);
      return;
    }
    router.push(`/store/${product.type}/${product.slug}`);
  };

  const handleBrandClick = (brand: 'Verse 3' | 'Crude City') => {
    if (brand === 'Crude City' && !isAgeVerified) {
      setPendingBrand(brand);
      setIsAgeGateOpen(true);
      return;
    }
    router.push(`/store?brand=${brand === 'Verse 3' ? 'v3' : 'crude'}`);
  };

  const onAgeConfirm = () => {
    sessionStorage.setItem('v3_age_verified', 'true');
    setIsAgeVerified(true);
    setIsAgeGateOpen(false);
    
    if (pendingProduct) {
      router.push(`/store/${pendingProduct.type}/${pendingProduct.slug}`);
      setPendingProduct(null);
    } else if (pendingBrand) {
      router.push(`/store?brand=${pendingBrand === 'Verse 3' ? 'v3' : 'crude'}`);
      setPendingBrand(null);
    }
  };

  const onAgeCancel = () => {
    setIsAgeGateOpen(false);
    setPendingProduct(null);
    setPendingBrand(null);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      if (firestore) {
        const subscriptionsCol = collection(firestore, 'newsletterSubscriptions');
        await addDocumentNonBlocking(subscriptionsCol, {
          email: email,
          subscribedAt: serverTimestamp(),
        });

        toast({
          title: "Welcome to the V3 Family!",
          description: "You've been added to our exclusive list.",
        });
        setEmail('');
      } else {
        throw new Error("Firestore not initialized");
      }
    } catch (err) {
      console.error("Newsletter error:", err);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was a problem joining the V3 family. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
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
                                            <div 
                                              onClick={() => handleProductClick(item)} 
                                              className="cursor-pointer block aspect-square relative bg-secondary rounded-lg overflow-hidden"
                                            >
                                                <Image
                                                    src={item.imageUrl || ''}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                />
                                            </div>
                                            <div className="mt-4 flex justify-between items-center px-1">
                                                <div>
                                                    <p className="font-bold text-black uppercase">{item.name}</p>
                                                    <p className="text-sm font-medium">{item.price}</p>
                                                </div>
                                                <Button 
                                                  size="sm" 
                                                  variant="secondary" 
                                                  onClick={() => handleProductClick(item)}
                                                  className="bg-black text-chart-1 hover:bg-black/90"
                                                >
                                                    <Eye className="h-4 w-4"/>
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
            </div>
       </section>

       {/* Shop By Brand Entry Section */}
       <section className="py-12 bg-black text-white">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-headline text-3xl font-bold uppercase tracking-[0.1em] italic text-chart-1">Choose Your Vibe</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleBrandClick('Verse 3')}
                size="lg"
                className="flex-1 h-20 bg-white text-black hover:bg-chart-1 font-headline text-2xl uppercase italic border-none rounded-none transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingBag className="mr-3 h-6 w-6" />
                V3 Merch
              </Button>
              <Button 
                onClick={() => handleBrandClick('Crude City')}
                size="lg"
                className="flex-1 h-20 bg-chart-1 text-black hover:bg-white font-headline text-2xl uppercase italic border-none rounded-none transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingBag className="mr-3 h-6 w-6" />
                Crude City
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
                                            <div 
                                              onClick={() => handleProductClick(item)}
                                              className="cursor-pointer block aspect-square relative rounded-lg overflow-hidden bg-white shadow-sm"
                                            >
                                                <Image
                                                    src={item.imageUrl || ''}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                />
                                            </div>
                                            <div className="mt-4 flex justify-between items-center px-1">
                                                <div>
                                                    <p className="font-bold text-black uppercase">{item.name}</p>
                                                    <p className="text-sm font-medium">{item.price}</p>
                                                </div>
                                                <Button 
                                                  size="sm" 
                                                  variant="secondary" 
                                                  onClick={() => handleProductClick(item)}
                                                  className="bg-black text-chart-1 hover:bg-black/90"
                                                >
                                                    <Eye className="h-4 w-4"/>
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

       {/* Instagram Section */}
       <section className="relative py-10 md:py-16 bg-black overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[40px] border-chart-1/10 rounded-full animate-spin" style={{ animationDuration: '60s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-[20px] border-chart-1/5 rounded-full animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
          </div>

          <div className="absolute -bottom-6 -right-6 md:-bottom-12 md:-right-12 select-none opacity-10">
            <h3 className="font-headline text-[6rem] md:text-[10rem] text-chart-1 leading-none">V3</h3>
          </div>
          
          <div className="container relative z-10">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
                <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-chart-1 blur-[60px] opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative h-16 w-16 md:h-20 md:w-20 bg-chart-1 flex items-center justify-center rounded-xl rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <Instagram className="h-8 w-8 md:h-10 md:w-10 text-black" />
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <h2 className="font-headline text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter italic">
                        JOIN THE <span className="text-chart-1">JOURNEY</span>
                    </h2>
                    <p className="text-sm md:text-lg text-white/60 max-w-xl mx-auto font-medium leading-tight">
                        We don't just release music; we build culture. <br className="hidden md:block" /> 
                        Get the raw, unfiltered view inside Verse3.
                    </p>
                </div>

                <div className="mt-8 w-full max-w-xs md:max-w-sm">
                    <Button asChild size="lg" className="w-full h-12 md:h-14 bg-chart-1 text-black hover:bg-white transition-all duration-500 font-bold text-lg md:text-xl uppercase italic tracking-tighter border-none rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                            Follow @verse3records
                        </a>
                    </Button>
                    
                    <div className="mt-6 flex justify-center gap-6 md:gap-10">
                         <div className="flex flex-col items-center">
                            <span className="text-chart-1 font-headline text-lg">LATEST</span>
                            <span className="text-white/40 text-[8px] uppercase tracking-widest">Releases</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-chart-1 font-headline text-lg">BEHIND</span>
                            <span className="text-white/40 text-[8px] uppercase tracking-widest">The Scenes</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="text-chart-1 font-headline text-lg">DIRECT</span>
                            <span className="text-white/40 text-[8px] uppercase tracking-widest">Connect</span>
                         </div>
                    </div>
                </div>
            </div>
          </div>
       </section>

       {/* Newsletter Section */}
       <section className="py-16 md:py-20 bg-chart-1 border-y border-black/10">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center text-center">
                <h2 className="font-headline text-4xl md:text-6xl font-bold text-black uppercase tracking-tighter italic leading-none mb-2">
                    Join The V3 Family
                </h2>
                <p className="text-black/80 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mb-8">
                    Join For Pre Releases, Discounts, News & More
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                    <Input 
                        type="email" 
                        placeholder="EMAIL ADDRESS" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-white/30 border-black/20 text-black placeholder:text-black/40 font-bold rounded-none focus-visible:ring-black/20"
                    />
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="h-12 bg-black text-chart-1 hover:bg-black/90 font-bold px-10 rounded-none uppercase italic transition-transform active:scale-95"
                    >
                        {isSubmitting ? 'Joining...' : 'Subscribe'}
                        <Send className="ml-2 h-4 w-4" />
                    </Button>
                </form>
            </div>
          </div>
       </section>

       <AgeGate 
         isOpen={isAgeGateOpen} 
         onConfirm={onAgeConfirm} 
         onCancel={onAgeCancel} 
       />
    </div>
  );
}
