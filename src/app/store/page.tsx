'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product, getAllProducts } from '@/lib/products';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Eye, DownloadCloud, Globe, Terminal } from 'lucide-react';
import { useRegion } from '@/context/region-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const ProductGrid = ({ products, isLoading, type }: { products: any[], isLoading?: boolean, type: 'merch' | 'music' }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[250px] w-full rounded-xl" />
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
        return <p className="text-muted-foreground text-center py-8">No {type} products available for this selection.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((item) => {
                const imageUrl = ('image' in item && item.image ? item.image.imageUrl : item.imageUrl) || 'https://picsum.photos/seed/placeholder/600/600';
                const imageDesc = ('image' in item && item.image ? item.image.description : item.description) || item.name;
                const imageHint = ('image' in item && item.image ? item.image.imageHint : '') || '';

                return (
                    <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                        <CardContent className="p-0 flex-grow">
                            <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative">
                            <Image
                                src={imageUrl}
                                alt={imageDesc}
                                fill
                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                data-ai-hint={imageHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                            </Link>
                        </CardContent>
                        <CardFooter className="p-4 flex justify-between items-center bg-card">
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-primary">{item.price}</p>
                        </div>
                        <Button size="sm" asChild>
                            <Link href={`/store/${item.type}/${item.slug}`}>
                                {item.digital ? <DownloadCloud className="mr-2 h-4 w-4"/> : <Eye className="mr-2 h-4 w-4"/>}
                                {item.digital ? 'Purchase' : 'View'}
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    );
};


export default function StorePage() {
  const { region, setRegion } = useRegion();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [verse3Merch, setVerse3Merch] = useState<Product[]>([]);
  const [crudeCityMerch, setCrudeCityMerch] = useState<Product[]>([]);
  const [physicalMusic, setPhysicalMusic] = useState<Product[]>([]);
  const [digitalMusic, setDigitalMusic] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
        setIsLoading(true);
        setFetchError(null);
        try {
            const products = await getAllProducts();
            setAllProducts(products);
        } catch (error: any) {
            console.error("Failed to fetch products:", error);
            setFetchError(error.message || "An unknown error occurred while fetching products.");
        } finally {
            setIsLoading(false);
        }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products whenever they are fetched or the region changes.
    if (allProducts.length > 0) {
      setVerse3Merch(allProducts.filter(p => p.type === 'merch' && p.brand === 'Verse 3 Merch'));
      setPhysicalMusic(allProducts.filter(p => p.type === 'music' && !p.digital));
      setDigitalMusic(allProducts.filter(p => p.type === 'music' && p.digital));

      const filteredCrudeCity = allProducts.filter(p => {
        // Must be Crude City merch
        if (p.brand !== 'Crude City' || p.type !== 'merch') {
          return false;
        }
        // If no regions are specified, show it everywhere.
        if (!p.availableRegions || !Array.isArray(p.availableRegions) || p.availableRegions.length === 0) {
          return true;
        }
        // Otherwise, check if the current region is included in the product's available regions.
        return p.availableRegions.includes(region);
      });
      setCrudeCityMerch(filteredCrudeCity);
    }
  }, [allProducts, region]);


  return (
    <div className="container py-12 md:py-24">
      <BackButton />
       <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Store</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Browse our collection of merchandise, vinyls, and more.</p>
       </div>

       {/* Region Selector */}
       <div className="mb-12 flex justify-center items-center gap-4">
         <Globe className="h-6 w-6 text-primary"/>
         <div className="max-w-xs w-full">
            <Select value={region} onValueChange={(value) => setRegion(value as 'UK' | 'EU')}>
              <SelectTrigger>
                  <SelectValue placeholder="Select your region for merch" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">Merchandise availability is based on your region.</p>
         </div>
       </div>

       {fetchError && (
        <Alert variant="destructive" className="mb-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Products</AlertTitle>
            <AlertDescription>
                <p>There was a problem loading products from Printful.</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-4 text-xs font-mono">
                    {fetchError}
                </pre>
            </AlertDescription>
        </Alert>
       )}


       {/* Verse 3 Merch Section */}
       <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Verse 3 Merch</h2>
            <ProductGrid products={verse3Merch} isLoading={isLoading} type="merch" />
       </section>

       {/* Crude City Merch Section */}
       <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Crude City</h2>
            <ProductGrid products={crudeCityMerch} isLoading={isLoading} type="merch" />
       </section>
       
       {/* Digital Music Section */}
       <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Digital Downloads</h2>
            <ProductGrid products={digitalMusic} isLoading={isLoading} type="music" />
       </section>

       {/* Physical Music Section */}
       <section>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Physical Music & More</h2>
            <ProductGrid products={physicalMusic} isLoading={isLoading} type="music" />
       </section>
    </div>
  );
}
