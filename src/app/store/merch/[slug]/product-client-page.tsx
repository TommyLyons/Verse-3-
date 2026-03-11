'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, CreditCard, Ruler, ShieldCheck } from 'lucide-react';
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
  const { addToCart, clearCart } = useCart();
  
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);

  const checkAgeVerified = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('v3_age_verified') === 'true';
  };

  useEffect(() => {
    const verified = checkAgeVerified();
    if (product.brand === 'Crude City' && !verified) {
      setIsAgeGateOpen(true);
    }

    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product.sizes, product.brand]);

  const onAgeConfirm = () => {
    sessionStorage.setItem('v3_age_verified', 'true');
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
    addToCart(product, quantity, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast({
            variant: 'destructive',
            title: 'Please select a size',
        });
        return;
    }
    clearCart();
    addToCart(product, quantity, selectedSize);
    router.push('/checkout');
  };
  
  const imageUrl = product.imageUrl || '';
  const imageDescription = product.description || '';

  const relatedProducts = getRelatedProducts(product, allProducts);

  return (
    <div className="container py-12 md:py-24 bg-background">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="relative aspect-square bg-secondary rounded-none overflow-hidden border-2 border-black/5 flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={imageDescription}
            fill
            className="object-contain p-0 transition-transform duration-700 hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {product.brand && (
            <Badge className="absolute top-6 left-6 bg-black text-chart-1 font-bold uppercase italic rounded-none px-4 py-1 text-xs">
              {product.brand}
            </Badge>
          )}
        </div>
        <div className="flex flex-col h-full">
          <div className="space-y-4">
            <h1 className="font-headline text-5xl md:text-7xl font-bold text-foreground leading-none uppercase italic tracking-tighter">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-chart-1 bg-black px-4 py-1 italic">{product.price}</p>
              <Badge variant="outline" className="border-black/20 text-muted-foreground font-bold uppercase italic">In Stock</Badge>
            </div>
          </div>
          
          <div className="mt-10 border-t-2 border-black/10 pt-8">
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">{product.description}</p>
          </div>
          
           <div className="mt-10 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label htmlFor="quantity-select" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Quantity</label>
                        <Select 
                            value={String(quantity)} 
                            onValueChange={(value) => setQuantity(parseInt(value, 10))}
                        >
                            <SelectTrigger id="quantity-select" className="h-14 border-2 border-black/10 focus:ring-black rounded-none font-bold">
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
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label htmlFor="size-select" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Select Size</label>
                                <span className="flex items-center text-[10px] text-muted-foreground font-bold uppercase gap-1 cursor-help hover:text-black transition-colors">
                                    <Ruler className="h-3 w-3" /> Size Guide
                                </span>
                            </div>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger id="size-select" className="h-14 border-2 border-black/10 focus:ring-black rounded-none font-bold">
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

          <div className="mt-12 w-full space-y-4">
            <Button 
                size="lg" 
                onClick={handleBuyNow} 
                className="w-full h-16 text-xl font-bold bg-chart-1 text-black hover:bg-black hover:text-chart-1 rounded-none uppercase italic transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              <CreditCard className="mr-3 h-6 w-6" />
              Buy Now Instantly
            </Button>
            
            <Button 
                size="lg" 
                variant="outline" 
                onClick={handleAddToCart} 
                className="w-full h-16 text-xl font-bold border-2 border-black rounded-none uppercase italic transition-all hover:bg-black/5" 
                disabled={addedToCart}
            >
              <ShoppingCart className="mr-3 h-6 w-6" />
              {addedToCart ? 'Added to Family!' : 'Add to Cart'}
            </Button>

            {addedToCart && (
                <Button size="lg" variant="ghost" className="w-full h-14 font-bold bg-black text-chart-1 hover:bg-black/90 rounded-none uppercase italic" asChild>
                    <Link href="/cart">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        View Cart & Checkout
                    </Link>
                </Button>
            )}
          </div>

          <div className="mt-10 p-6 bg-black/5 border-2 border-black/5 space-y-4">
             <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black/60">
                <ShieldCheck className="h-4 w-4 text-chart-1" />
                Secure Payments via Stripe
             </div>
             <div className="flex flex-wrap gap-x-8 gap-y-2 text-[9px] font-bold uppercase text-muted-foreground tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-chart-1" />
                    Premium V3 Quality
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-chart-1" />
                    Limited Edition
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-chart-1" />
                    Express Shipping
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-24 border-t-2 border-black/10 pt-20">
          <div className="text-center mb-16">
            <h2 className="font-headline text-5xl font-bold text-foreground uppercase italic tracking-tighter">You Might <span className="text-chart-1">Also Like</span></h2>
            <div className="h-1 w-24 bg-chart-1 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {relatedProducts.map((item: Product) => (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col border-none bg-transparent">
                    <CardContent className="p-0 flex-grow">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative bg-secondary rounded-none overflow-hidden border-2 border-black/5">
                          <Image
                              src={item.imageUrl || ''}
                              alt={item.name}
                              fill
                              className="object-contain p-0 transition-transform duration-700 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </Link>
                    </CardContent>
                    <div className="mt-6 flex justify-between items-end px-2">
                        <div>
                            <p className="font-bold text-foreground uppercase text-lg leading-none mb-2">{item.name}</p>
                            <p className="text-xl font-bold text-chart-1 bg-black px-3 py-1 inline-block italic">{item.price}</p>
                        </div>
                        <Button size="icon" variant="default" className="bg-black text-chart-1 hover:bg-chart-1 hover:text-black transition-colors rounded-none h-12 w-12" asChild>
                            <Link href={`/store/${item.type}/${item.slug}`}>
                                <Eye className="h-6 w-6"/>
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
