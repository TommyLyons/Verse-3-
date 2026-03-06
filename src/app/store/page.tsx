
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product, getAllProducts } from '@/lib/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Eye, DownloadCloud, Globe } from 'lucide-react';
import { useRegion } from '@/context/region-context';
import { AgeGate } from '@/components/age-gate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';

const ProductGrid = ({ products, isLoading, type, onProductClick }: { products: any[], isLoading?: boolean, type: 'merch' | 'music', onProductClick?: (item: any) => void }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No products found in this region.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((item) => (
                <Card key={item.id || item.slug} className="overflow-hidden group flex flex-col border-none bg-transparent">
                    <CardContent className="p-0">
                        <div 
                          onClick={() => onProductClick?.(item)}
                          className="cursor-pointer block aspect-square relative bg-secondary rounded-lg overflow-hidden border-2 border-black/5"
                        >
                            <Image
                                src={item.imageUrl || 'https://picsum.photos/seed/placeholder/600/600'}
                                alt={item.name}
                                fill
                                className="object-contain transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 25vw"
                            />
                        </div>
                    </CardContent>
                    <div className="mt-4 flex justify-between items-center px-1">
                        <div>
                            <p className="font-bold text-black uppercase text-sm leading-tight">{item.name}</p>
                            <p className="text-sm font-bold text-chart-1 bg-black px-2 py-0.5 inline-block italic mt-1">{item.price}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => onProductClick?.(item)}
                          className="bg-black text-chart-1 font-bold hover:bg-black/80 rounded-none h-10 w-10 p-0"
                        >
                            {item.digital ? <DownloadCloud className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

function StoreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { region, setRegion } = useRegion();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState<'Verse 3' | 'Crude City'>('Verse 3');
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem('v3_age_verified') === 'true';
    setIsAgeVerified(verified);

    const initialBrand = searchParams.get('brand');
    if (initialBrand === 'crude' && verified) {
      setActiveBrand('Crude City');
    } else if (initialBrand === 'crude' && !verified) {
      setIsAgeGateOpen(true);
    }

    async function fetchProducts() {
        setIsLoading(true);
        try {
            const products = await getAllProducts();
            setAllProducts(products);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchProducts();
  }, [searchParams]);

  const handleBrandSwitch = (brand: 'Verse 3' | 'Crude City') => {
    if (brand === 'Crude City' && !isAgeVerified) {
      setIsAgeGateOpen(true);
      return;
    }
    setActiveBrand(brand);
  };

  const handleProductClick = (product: Product) => {
    if (product.brand === 'Crude City' && !isAgeVerified) {
      setPendingProduct(product);
      setIsAgeGateOpen(true);
      return;
    }
    router.push(`/store/${product.type}/${product.slug}`);
  };

  const onAgeConfirm = () => {
    sessionStorage.setItem('v3_age_verified', 'true');
    setIsAgeVerified(true);
    setIsAgeGateOpen(false);
    if (pendingProduct) {
      router.push(`/store/${pendingProduct.type}/${pendingProduct.slug}`);
      setPendingProduct(null);
    } else {
      setActiveBrand('Crude City');
    }
  };

  const onAgeCancel = () => {
    setIsAgeGateOpen(false);
    setPendingProduct(null);
    if (activeBrand === 'Crude City') setActiveBrand('Verse 3');
  };

  const verse3Merch = useMemo(() => {
    return allProducts.filter(p => 
      p.type === 'merch' && 
      p.brand === 'Verse 3 Merch' && 
      (!p.availableRegions || p.availableRegions.length === 0 || p.availableRegions.includes(region))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts, region]);

  const physicalMusic = useMemo(() => 
    allProducts.filter(p => p.type === 'music' && !p.digital).sort((a, b) => a.name.localeCompare(b.name)),
  [allProducts]);

  const digitalMusic = useMemo(() => 
    allProducts.filter(p => p.type === 'music' && p.digital).sort((a, b) => a.name.localeCompare(b.name)),
  [allProducts]);

  const crudeCityMerch = useMemo(() => 
    allProducts.filter(p => 
      p.brand === 'Crude City' && 
      p.type === 'merch' && 
      (!p.availableRegions || p.availableRegions.length === 0 || p.availableRegions.includes(region))
    ).sort((a, b) => a.name.localeCompare(b.name)),
  [allProducts, region]);

  const regionLabel = region === 'UK' ? 'United Kingdom' : 'Europe';

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-black uppercase tracking-tighter italic">V3 <span className="text-chart-1">STORE</span></h1>
        <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-xs">Official Merchandise & Music</p>
       </div>

       <div className="mb-16 flex flex-col items-center gap-8">
         <div className="flex w-full max-w-md gap-2 p-1 bg-black/5 rounded-none border-2 border-black/10">
            <Button 
                onClick={() => handleBrandSwitch('Verse 3')}
                variant={activeBrand === 'Verse 3' ? 'default' : 'ghost'}
                className={`flex-1 h-12 font-headline text-xl uppercase italic rounded-none transition-all ${activeBrand === 'Verse 3' ? 'bg-black text-chart-1' : 'text-black hover:bg-black/5'}`}
            >
                Verse 3
            </Button>
            <Button 
                onClick={() => handleBrandSwitch('Crude City')}
                variant={activeBrand === 'Crude City' ? 'default' : 'ghost'}
                className={`flex-1 h-12 font-headline text-xl uppercase italic rounded-none transition-all ${activeBrand === 'Crude City' ? 'bg-black text-chart-1' : 'text-black hover:bg-black/5'}`}
            >
                Crude City
            </Button>
         </div>

         <div className="max-w-xs w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-chart-1"/>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Region</span>
            </div>
            <Select value={region} onValueChange={(value) => setRegion(value as 'UK' | 'EU')}>
              <SelectTrigger className="border-2 border-black bg-white text-black h-12 focus:ring-black rounded-none font-bold uppercase text-xs">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-black">
                  <SelectItem value="UK">United Kingdom (GBP)</SelectItem>
                  <SelectItem value="EU">European Union (EUR)</SelectItem>
              </SelectContent>
            </Select>
         </div>
       </div>

       {activeBrand === 'Verse 3' ? (
         <>
           <section className="mb-20">
                <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-2">
                    <h2 className="font-headline text-4xl font-bold text-black uppercase italic tracking-tighter">V3 Merch <span className="text-chart-1">{regionLabel}</span></h2>
                    <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Premium Streetwear</span>
                </div>
                <ProductGrid products={verse3Merch} isLoading={isLoading} type="merch" onProductClick={handleProductClick} />
           </section>
           
           <section className="mb-20">
                <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-2">
                    <h2 className="font-headline text-4xl font-bold text-black uppercase italic tracking-tighter">Digital <span className="text-chart-1">Downloads</span></h2>
                    <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Instant Access</span>
                </div>
                <ProductGrid products={digitalMusic} isLoading={isLoading} type="music" onProductClick={handleProductClick} />
           </section>

           <section>
                <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-2">
                    <h2 className="font-headline text-4xl font-bold text-black uppercase italic tracking-tighter">Physical <span className="text-chart-1">Music</span></h2>
                    <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Vinyl & CDs</span>
                </div>
                <ProductGrid products={physicalMusic} isLoading={isLoading} type="music" onProductClick={handleProductClick} />
           </section>
         </>
       ) : (
         <section className="mb-20">
            <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-2">
                <h2 className="font-headline text-4xl font-bold text-black uppercase italic tracking-tighter">Crude City <span className="text-chart-1">{regionLabel}</span></h2>
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Raw Culture</span>
            </div>
            <ProductGrid products={crudeCityMerch} isLoading={isLoading} type="merch" onProductClick={handleProductClick} />
         </section>
       )}

       <AgeGate 
         isOpen={isAgeGateOpen} 
         onConfirm={onAgeConfirm} 
         onCancel={onAgeCancel} 
       />
    </>
  );
}

export default function StorePage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-12 md:py-24 bg-white">
      <BackButton />
      <Suspense fallback={<div className="text-center py-20 font-headline text-2xl animate-pulse">Loading Store...</div>}>
        <StoreContent />
      </Suspense>
    </div>
  );
}
