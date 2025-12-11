
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { ShoppingCart } from 'lucide-react';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

const merchProducts = [
    { id: 1, name: 'Verse3 Logo Hoodie', price: '$59.99', image: getImage('merch-hoodie'), revolutLink: 'https://revolut.me/test-business-studio/50' },
    { id: 3, name: 'Verse3 Logo Cap', price: '$24.99', image: getImage('merch-cap'), revolutLink: 'https://revolut.me/test-business-studio/25' },
];

const musicProducts = [
    { id: 2, name: 'DJ Lofty - Midnight Drive Vinyl', price: '$29.99', image: getImage('merch-vinyl'), revolutLink: '#' },
    { id: 4, name: 'Verse3 Album Art Poster', price: '$19.99', image: getImage('album-art-1'), revolutLink: '#' },
];


export default function StorePage() {
  return (
    <div className="container py-12 md:py-24">
      <BackButton />
       <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-chart-1">Store</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Browse our collection of merchandise, vinyls, and more.</p>
       </div>

       {/* Merchandise Section */}
       <section className="mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Merchandise</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {merchProducts.map((item) => (
                <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                    <CardContent className="p-0 flex-grow">
                    {item.image && (
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
                    )}
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between items-center bg-card">
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-primary">{item.price}</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={item.revolutLink} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="mr-2 h-4 w-4"/>
                        Buy Now
                        </Link>
                    </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
       </section>

       {/* Music Section */}
       <section>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-8">Music</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {musicProducts.map((item) => (
                <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                    <CardContent className="p-0 flex-grow">
                    {item.image && (
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
                    )}
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between items-center bg-card">
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-primary">{item.price}</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={item.revolutLink} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="mr-2 h-4 w-4"/>
                        Buy Now
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
