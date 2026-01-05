
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/products';
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
} from "@/components/ui/select"


export default function StorePage() {
  const { region, setRegion } = useRegion();

  const merchProducts = products.filter(p => p.type === 'merch' && (!p.availableRegions || p.availableRegions.includes(region)));
  const physicalMusicProducts = products.filter(p => p.type === 'music' && !p.digital);
  const digitalMusicProducts = products.filter(p => p.type === 'music' && p.digital);

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

       {/* Merchandise Section */}
       <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Merchandise</h2>
            {merchProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {merchProducts.map((item) => (
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
                              <Eye className="mr-2 h-4 w-4"/>
                              View
                          </Link>
                      </Button>
                      </CardFooter>
                  </Card>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No merchandise available for the selected region.</p>
            )}
       </section>
       
       {/* Digital Music Section */}
       {digitalMusicProducts.length > 0 && (
         <section className="mb-16">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Digital Downloads</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {digitalMusicProducts.map((item) => (
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
                              <DownloadCloud className="mr-2 h-4 w-4"/>
                              Purchase
                          </Link>
                      </Button>
                      </CardFooter>
                  </Card>
                  ))}
              </div>
         </section>
       )}

       {/* Physical Music Section */}
       <section>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Physical Music & More</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {physicalMusicProducts.map((item) => (
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
                            <Eye className="mr-2 h-4 w-4"/>
                            View
                        </Link>
                    </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
       </section>
    </div>
  );
}
