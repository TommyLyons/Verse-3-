'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Instagram, Send, ShoppingBag } from 'lucide-react';
import { getAllProducts, type Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';
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
        try {
          const products = await getAllProducts();
          setAllProducts(products);
        } catch (err) {
          console.error("Failed to fetch home products:", err);
        } finally {
          setIsLoading(false);
        }
    }
    fetchProducts();
  }, []);
  
  const merchProducts = React.useMemo(() => {
    return allProducts.filter(p => p.type === 'merch').slice(0, 8);
  }, [allProducts]);

  const musicProducts = React.useMemo(() => {
    return allProducts.filter(p => p.type === 'music').slice(0, 8);
  }, [allProducts]);

  const vibeHero = PlaceHolderImages.find(img => img.id === 'vibe-hero');

  const handleProductClick = (product: Product) => {
    if (product.brand === 'Crude City' && !isAgeVerified) {
      setPendingProduct(product);
      setIsAgeGateOpen(true);
      return;
    }
    const targetPath = `/store/${product.type}/${product.slug}`;
    router.push(targetPath);
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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firestore) return;

    setIsSubmitting(true);
    const subscriptionsCol = collection(firestore, 'newsletterSubscriptions');
    addDocumentNonBlocking(subscriptionsCol, {
      email: email,
      subscribedAt: serverTimestamp(),
    });

    toast({ title: "Welcome to the V3 Family!", description: "You've been added to our exclusive list." });
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex flex-col items-center justify-center bg-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            src="https://firebasestorage.googleapis.com/v0/b/studio-6967403383-a8bb0.firebasestorage.app/o/WhatsApp%20Video%202025-11-19%20at%2018.15.08.mp4?alt=media&token=c2aaa55b-f264-4ef6-a86c-13e63d82cb85"
            autoPlay loop muted playsInline
            className="w-full h-full object-cover md:object-contain mix-blend-multiply"
          />
        </div>
        <div className="absolute bottom-12 z-10 flex gap-4 px-6 w-full max-w-sm mx-auto">
          <Button asChild className="flex-1 bg-black text-chart-1 font-bold h-11 rounded-none uppercase italic tracking-wider shadow-lg hover:bg-chart-1 hover:text-black transition-all">
            <Link href="/store">Shop Merch</Link>
          </Button>
          <Button asChild className="flex-1 bg-black text-chart-1 font-bold h-11 rounded-none uppercase italic tracking-wider shadow-lg hover:bg-chart-1 hover:text-black transition-all">
            <Link href="/music">Music Masters</Link>
          </Button>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white border-b border-black/5">
          <div className="container max-w-4xl mx-auto px-4 text-center">
              <h2 className="font-headline text-4xl font-bold text-black uppercase italic tracking-tight">Our Vision</h2>
              <div className="h-1 w-20 bg-chart-1 mx-auto mt-2 mb-6" />
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                  Championing emerging talent and delivering emotionally powerful records. Real stories, authentic global community.
              </p>
          </div>
      </section>

      {/* Impact Image precisely above Choice section per 34172f3 */}
      {vibeHero && (
        <section className="w-full bg-black py-4">
          <div className="relative w-full aspect-[21/9] max-w-screen-2xl mx-auto">
            <Image
              src={vibeHero.imageUrl}
              alt={vibeHero.description}
              fill
              className="object-contain"
              priority
            />
          </div>
        </section>
      )}

      {/* Choose Your Vibe */}
      <section className="py-12 bg-black text-white">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-headline text-3xl font-bold uppercase italic text-chart-1 tracking-widest">Choose Your Vibe</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
              <Button 
                onClick={() => handleBrandClick('Verse 3')}
                className="flex-1 h-14 bg-white text-black hover:bg-chart-1 font-headline text-xl uppercase italic rounded-none transition-all duration-300"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                V3 Merch
              </Button>
              <Button 
                onClick={() => handleBrandClick('Crude City')}
                className="flex-1 h-14 bg-chart-1 text-black hover:bg-white font-headline text-xl uppercase italic rounded-none transition-all duration-300"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Crude City
              </Button>
            </div>
          </div>
       </section>

       {/* Featured Merch Carousel */}
       <section className="py-24 bg-white">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-5xl font-bold text-black uppercase italic tracking-tighter">Featured <span className="text-chart-1">Merch</span></h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Premium V3 Collections</p>
                </div>
                
                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-none" />)}
                    </div>
                ) : (
                    <div className="relative px-4 md:px-0">
                        <Carousel opts={{ align: "start", loop: true }} className="w-full">
                            <CarouselContent className="-ml-4">
                                {merchProducts.map((item) => (
                                    <CarouselItem key={item.id} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/4">
                                        <Card className="border-none shadow-none bg-transparent group cursor-pointer" onClick={() => handleProductClick(item)}>
                                            <div className="aspect-square relative bg-secondary rounded-none overflow-hidden border-2 border-black/5">
                                                <Image
                                                    src={item.imageUrl || ''}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain p-14 transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 100vw, 25vw"
                                                />
                                            </div>
                                            <div className="mt-4 flex justify-between items-center px-1">
                                                <div>
                                                    <p className="font-bold text-black uppercase text-sm leading-tight">{item.name}</p>
                                                    <p className="text-xs font-bold text-chart-1 bg-black px-2 py-0.5 inline-block mt-1 italic">{item.price}</p>
                                                </div>
                                                <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-black rounded-none hover:bg-black hover:text-chart-1">
                                                    <Eye className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="-left-12 hidden lg:flex border-black text-black" />
                            <CarouselNext className="-right-12 hidden lg:flex border-black text-black" />
                        </Carousel>
                    </div>
                )}
            </div>
       </section>

       {/* Latest Music Carousel - Strict Music Only Filtering */}
       <section className="py-24 bg-secondary/30">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-5xl font-bold text-black uppercase italic tracking-tighter">Latest <span className="text-chart-1">Music</span></h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Authorized Audio Masters</p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-none" />)}
                    </div>
                ) : (
                    <div className="relative px-4 md:px-0">
                        <Carousel opts={{ align: "start", loop: true }} className="w-full">
                            <CarouselContent className="-ml-4">
                                {musicProducts.map((item) => (
                                    <CarouselItem key={item.id} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/4">
                                        <Card className="border-none shadow-none bg-transparent group cursor-pointer" onClick={() => handleProductClick(item)}>
                                            <div className="aspect-square relative bg-white rounded-none overflow-hidden shadow-sm border-2 border-black/5">
                                                <Image
                                                    src={item.imageUrl || ''}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain p-14 transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 100vw, 25vw"
                                                />
                                            </div>
                                            <div className="mt-4 flex justify-between items-center px-1">
                                                <div>
                                                    <p className="font-bold text-black uppercase text-sm leading-tight">{item.name}</p>
                                                    <p className="text-xs font-bold text-chart-1 bg-black px-2 py-0.5 inline-block mt-1 italic">{item.price}</p>
                                                </div>
                                                <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-black rounded-none hover:bg-black hover:text-chart-1">
                                                    <Eye className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="-left-12 hidden lg:flex border-black text-black" />
                            <CarouselNext className="-right-12 hidden lg:flex border-black text-black" />
                        </Carousel>
                    </div>
                )}
            </div>
       </section>

       {/* Social Section */}
       <section className="py-24 bg-black text-white text-center">
          <div className="container max-w-5xl mx-auto px-4">
            <Instagram className="h-12 w-12 mx-auto text-chart-1 mb-6" />
            <h2 className="font-headline text-5xl md:text-7xl font-bold uppercase italic tracking-tighter mb-4">Join The <span className="text-chart-1">Journey</span></h2>
            <p className="text-white/60 mb-10 font-medium max-w-xl mx-auto">Behind the scenes, new drops, and culture. No filters.</p>
            <Button asChild size="lg" className="h-14 px-12 bg-chart-1 text-black hover:bg-white font-bold text-xl uppercase italic rounded-none">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@verse3records</a>
            </Button>
          </div>
       </section>

       {/* Newsletter Section */}
       <section className="py-24 bg-chart-1">
          <div className="container max-w-4xl mx-auto px-4 text-center">
                <h2 className="font-headline text-5xl font-bold text-black uppercase italic tracking-tighter mb-8">Join The Family</h2>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <input 
                        type="email" 
                        placeholder="EMAIL ADDRESS" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-white/40 border-black/10 text-black placeholder:text-black/40 font-bold rounded-none px-4 flex-grow outline-none focus:bg-white/60 transition-colors"
                    />
                    <Button type="submit" disabled={isSubmitting} className="h-12 bg-black text-chart-1 hover:bg-black/90 font-bold px-10 rounded-none uppercase italic">
                        {isSubmitting ? 'Joining...' : 'Subscribe'}
                        <Send className="ml-2 h-4 w-4" />
                    </Button>
                </form>
            </div>
       </section>

       <AgeGate isOpen={isAgeGateOpen} onConfirm={onAgeConfirm} onCancel={onAgeCancel} />
    </div>
  );
}
