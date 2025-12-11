
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts, products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState } from 'react';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000); // Reset after 3 seconds
  };

  const relatedProducts = getRelatedProducts(product);

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-square">
          <Image
            src={product.image.imageUrl}
            alt={product.image.description}
            fill
            className="object-cover rounded-lg"
            data-ai-hint={product.image.imageHint}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col h-full">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mt-2">{product.price}</p>
          <p className="text-muted-foreground mt-4 text-lg flex-grow">{product.description}</p>
          <div className="mt-8 w-full space-y-4">
            <Button size="lg" onClick={handleAddToCart} className="w-full" disabled={addedToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </Button>
             {addedToCart && (
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href="/cart">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  View Cart
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-24">
          <h2 className="font-headline text-3xl font-bold text-center mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {relatedProducts.map((item) => (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                    <CardContent className="p-0 flex-grow">
                        <div className="aspect-square relative">
                        <Image
                            src={item.image.imageUrl}
                            alt={item.image.description}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={item.image.imageHint}
                            sizes="(max-width: 640px) 100vw, 50vw"
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
        </div>
      )}
    </div>
  );
}
