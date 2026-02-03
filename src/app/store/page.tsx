'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product, getAllProducts } from '@/lib/products';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Eye, DownloadCloud, Globe } from 'lucide-react';
import { useRegion } from '@/context/region-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/skeleton';

const ProductGrid = ({ products, isLoading, type }: { products: any[], isLoading?: boolean, type: 'merch' | 'music' }) => {
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
        return <p className="text-muted-foreground text-center py-8">No {type} products available.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((item) => (
                <Card key={item.id} className="overflow-hidden group flex flex-col border-none bg-transparent">
                    <CardContent className="p-0">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative bg-secondary rounded-lg overflow-hidden">
                            <Image
                                src={item.imageUrl || 'https://picsum.photos/seed/placeholder/600/600'}
                                alt={item.name}
                                fill
                                className="object-contain transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 25vw"
                            />
                        </Link>
                    </CardContent>
                    <div className="mt-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-black uppercase">{item.name}</p>
                            <p className="text-sm font-medium">{item.price}</p>
                        </div>
                        <Button size="sm" asChild className="bg-black text-chart-1 font-bold">
                            <Link href={`/store/${item.type}/${item.slug}`}>
                                {item.digital ? <DownloadCloud className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            </Link>
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default function StorePage() {
  const { region, setRegion } = useRegion();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const verse3Merch = allProducts.filter(p => p.type === 'merch' && p.brand === 'Verse 3 Merch');
  const physicalMusic = allProducts.filter(p => p.type === 'music' && !p.digital);
  const digitalMusic = allProducts.filter(p => p.type === 'music' && p.digital);
  const crudeCityMerch = allProducts.filter(p => p.brand === 'Crude City' && p.type === 'merch' && (!p.availableRegions || p.availableRegions.includes(region)));

  return (
    <div className="container py-12 md:py-24 bg-white">
      <BackButton />
       <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-black uppercase tracking-wider">Store</h1>
        <p className="text-muted-foreground mt-2">Merchandise, vinyls, and more.</p>
       </div>

       <div className="mb-12 flex flex-col items-center gap-4">
         <div className="max-w-xs w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-black"/>
                <span className="text-xs font-bold uppercase">Region Selection</span>
            </div>
            <Select value={region} onValueChange={(value) => setRegion(value as 'UK' | 'EU')}>
              <SelectTrigger className="border-black bg-white">
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
              </SelectContent>
            </Select>
         </div>
       </div>

       <section className="mb-20">
            <h2 className="font-headline text-2xl font-bold text-black mb-8 uppercase border-b pb-2">Verse 3 Merch</h2>
            <ProductGrid products={verse3Merch} isLoading={isLoading} type="merch" />
       </section>

       <section className="mb-20">
            <h2 className="font-headline text-2xl font-bold text-black mb-8 uppercase border-b pb-2">Crude City</h2>
            <ProductGrid products={crudeCityMerch} isLoading={isLoading} type="merch" />
       </section>
       
       <section className="mb-20">
            <h2 className="font-headline text-2xl font-bold text-black mb-8 uppercase border-b pb-2">Digital Downloads</h2>
            <ProductGrid products={digitalMusic} isLoading={isLoading} type="music" />
       </section>

       <section>
            <h2 className="font-headline text-2xl font-bold text-black mb-8 uppercase border-b pb-2">Physical Music</h2>
            <ProductGrid products={physicalMusic} isLoading={isLoading} type="music" />
       </section>
    </div>
  );
}
