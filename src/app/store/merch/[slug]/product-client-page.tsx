'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, CreditCard } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const getRelatedProducts = (currentProduct: Product, allProducts: Product[]) => {
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    return allProducts.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};

export function ProductClientPage({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(
    (product.sizes && product.sizes.length > 0) ? product.sizes[0] : ''
  );
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast({
            variant: 'destructive',
            title: 'Please select a size',
        });
        return;
    }
    if (quantity < 1) {
        toast({
            variant: 'destructive',
            title: 'Quantity must be at least 1',
        });
        return;
    }
    addToCart(product, quantity, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };
  
  const imageUrl = product.imageUrl || '';
  const imageDescription = product.description || '';
  const imageHint = '';

  const relatedProducts = getRelatedProducts(product, allProducts);

  return (
    <div className="container py-12 md:py-24 bg-background">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={imageDescription}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint={imageHint}
          />
        </div>
        <div className="flex flex-col h-full">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
          <p className="text-2xl font-semibold text-foreground mt-2">{product.price}</p>
          <p className="text-muted-foreground mt-4 text-lg flex-grow">{product.description}</p>
          
           <div className="mt-8 space-y-4">
                 <div>
                    <label htmlFor="quantity-select" className="text-sm font-medium text-muted-foreground">Quantity</label>
                     <Select 
                        value={String(quantity)} 
                        onValueChange={(value) => setQuantity(parseInt(value, 10))}
                     >
                        <SelectTrigger id="quantity-select" className="w-full md:w-1/2 border-input bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[...Array(10)].map((_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                    {i + 1}
                                </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                 </div>
                {product.sizes && product.sizes.length > 0 && (
                     <div>
                        <label htmlFor="size-select" className="text-sm font-medium text-muted-foreground">Size</label>
                        <Select value={selectedSize} onValueChange={setSelectedSize}>
                            <SelectTrigger id="size-select" className="w-full md:w-1/2 border-input bg-background">
                                <SelectValue placeholder="Select a size" />
                            </SelectTrigger>
                            <SelectContent>
                                {product.sizes.map(size => (
                                    <SelectItem key={size} value={size}>{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                )}
           </div>

          <div className="mt-8 w-full space-y-4">
            <Button size="lg" onClick={handleAddToCart} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={addedToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </Button>
             <Button size="lg" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <a href={product.revolutLink} target="_blank" rel="noopener noreferrer">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Buy Now
                </a>
              </Button>
             {addedToCart && (
              <Button size="lg" variant="ghost" className="w-full text-primary hover:bg-primary/10" asChild>
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
          <h2 className="font-headline text-3xl font-bold text-center mb-8 text-foreground">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {relatedProducts.map((item: Product) => (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col border-border bg-card">
                    <CardContent className="p-0 flex-grow">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative">
                          <Image
                              src={item.imageUrl || ''}
                              alt={item.name}
                              fill
                              className="object-contain transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </Link>
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between items-center bg-card">
                    <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.price}</p>
                    </div>
                    <Button size="sm" variant="default" className="bg-primary text-primary-foreground" asChild>
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
