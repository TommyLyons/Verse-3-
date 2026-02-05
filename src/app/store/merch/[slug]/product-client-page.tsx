
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, CreditCard, Ruler } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AgeGate } from '@/components/age-gate';
import { useRouter } from 'next/navigation';

const getRelatedProducts = (currentProduct: Product, allProducts: Product[]) => {
    const oppositeType = currentProduct.type === 'merch' ? 'music' : 'merch';
    return allProducts.filter(p => p.id !== currentProduct.id && p.type === oppositeType).slice(0, 2);
};

export function ProductClientPage({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  // Initialize selected size and age verification state
  useEffect(() => {
    const verified = sessionStorage.getItem('v3_age_verified') === 'true';
    setIsAgeVerified(verified);

    if (product.brand === 'Crude City' && !verified) {
      setIsAgeGateOpen(true);
    }

    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product.sizes, product.brand]);

  const onAgeConfirm = () => {
    sessionStorage.setItem('v3_age_verified', 'true');
    setIsAgeVerified(true);
    setIsAgeGateOpen(false);
  };

  const onAgeCancel = () => {
    setIsAgeGateOpen(false);
    router.push('/store');
  };

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
        <div className="relative aspect-square bg-secondary rounded-xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={imageDescription}
            fill
            className="object-contain p-4 transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint={imageHint}
            priority
          />
          {product.brand && (
            <Badge className="absolute top-4 right-4 bg-black text-chart-1 font-bold uppercase italic">
              {product.brand}
            </Badge>
          )}
        </div>
        <div className="flex flex-col h-full">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground leading-none uppercase italic">{product.name}</h1>
            <p className="text-3xl font-bold text-primary italic">{product.price}</p>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
          </div>
          
           <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="quantity-select" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quantity</label>
                        <Select 
                            value={String(quantity)} 
                            onValueChange={(value) => setQuantity(parseInt(value, 10))}
                        >
                            <SelectTrigger id="quantity-select" className="h-12 border-2 focus:ring-black">
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
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="size-select" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Size</label>
                                <span className="flex items-center text-[10px] text-muted-foreground font-bold uppercase gap-1">
                                    <Ruler className="h-3 w-3" /> Size Guide
                                </span>
                            </div>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger id="size-select" className="h-12 border-2 focus:ring-black">
                                    <SelectValue placeholder="Size" />
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
           </div>

          <div className="mt-10 w-full space-y-4">
            <Button size="lg" onClick={handleAddToCart} className="w-full h-14 text-lg font-bold bg-black text-chart-1 hover:bg-black/90 rounded-none uppercase italic" disabled={addedToCart}>
              <ShoppingCart className="mr-2 h-6 w-6" />
              {addedToCart ? 'Added to Family!' : 'Add to Cart'}
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
                <Button size="lg" variant="outline" className="h-14 font-bold border-2 border-black rounded-none uppercase italic" asChild>
                    <a href={product.revolutLink} target="_blank" rel="noopener noreferrer">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Buy Now
                    </a>
                </Button>
                {addedToCart && (
                    <Button size="lg" variant="ghost" className="h-14 font-bold bg-chart-1 text-black hover:bg-chart-1/80 rounded-none uppercase italic" asChild>
                        <Link href="/cart">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Checkout
                        </Link>
                    </Button>
                )}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-1" />
                Premium Quality
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-1" />
                V3 Exclusive
            </div>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-1" />
                Fast Shipping
            </div>
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-24 border-t pt-16">
          <h2 className="font-headline text-4xl font-bold text-center mb-12 text-foreground uppercase italic tracking-tighter">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {relatedProducts.map((item: Product) => (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col border-none bg-transparent">
                    <CardContent className="p-0 flex-grow">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative bg-secondary rounded-xl overflow-hidden">
                          <Image
                              src={item.imageUrl || ''}
                              alt={item.name}
                              fill
                              className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </Link>
                    </CardContent>
                    <div className="p-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-foreground uppercase">{item.name}</p>
                            <p className="text-sm font-medium text-primary">{item.price}</p>
                        </div>
                        <Button size="sm" variant="default" className="bg-black text-chart-1 font-bold" asChild>
                            <Link href={`/store/${item.type}/${item.slug}`}>
                                <Eye className="h-4 w-4"/>
                            </Link>
                        </Button>
                    </div>
                </Card>
            ))}
          </div>
        </div>
      )}

      <AgeGate 
        isOpen={isAgeGateOpen} 
        onConfirm={onAgeConfirm} 
        onCancel={onAgeCancel} 
      />
    </div>
  );
}
