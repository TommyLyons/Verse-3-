
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { products as staticProducts, Product } from '@/lib/products';
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
import { getProducts } from '@/ai/flows/get-products-flow';
import { Skeleton } from '@/components/ui/skeleton';


const ProductGrid = ({ products, isLoading }: { products: Product[], isLoading?: boolean }) => {
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
        return <p className="text-muted-foreground text-center py-8">No products available for this selection.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((item) => (
            <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                <CardContent className="p-0 flex-grow">
                    <div className="aspect-square relative">
                    <Image
                        src={item.image.imageUrl}
                        alt={item.image.description}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={item.image.imageHint}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                    </div>
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
            ))}
        </div>
    );
};

function CrudeCitySection({ region }: { region: 'UK' | 'EU' }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getProducts('Crude City')
            .then(fetchedProducts => {
                const availableProducts = fetchedProducts.filter(p => !p.availableRegions || p.availableRegions.includes(region));
                setProducts(availableProducts);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [region]);

    return (
        <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Crude City</h2>
            <ProductGrid products={products} isLoading={isLoading} />
        </section>
    );
}


export default function StorePage() {
  const { region, setRegion } = useRegion();

  const verse3Merch = staticProducts.filter(p => p.type === 'merch' && p.brand === 'Verse 3 Merch' && (!p.availableRegions || p.availableRegions.includes(region)));
  const physicalMusicProducts = staticProducts.filter(p => p.type === 'music' && !p.digital);
  const digitalMusicProducts = staticProducts.filter(p => p.type === 'music' && p.digital);

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
       <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-chart-1">Store</h1>
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

       {/* Verse 3 Merch Section */}
       <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Verse 3 Merch</h2>
            <ProductGrid products={verse3Merch} />
       </section>

       {/* Crude City Merch Section */}
       <CrudeCitySection region={region} />
       
       {/* Digital Music Section */}
       {digitalMusicProducts.length > 0 && (
         <section className="mb-16">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Digital Downloads</h2>
              <ProductGrid products={digitalMusicProducts} />
         </section>
       )}

       {/* Physical Music Section */}
       <section>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Physical Music & More</h2>
            <ProductGrid products={physicalMusicProducts} />
       </section>
    </div>
  );
}
