
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getRelatedProducts, type Product, getAllProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, CreditCard } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';

function ProductPageContent({ slug }: { slug: string }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    async function fetchProductData() {
        if (!firestore) return;
        setIsLoading(true);
        
        const allProducts = await getAllProducts(firestore);
        const fetchedProduct = allProducts.find(p => p.slug === slug);
        setProduct(fetchedProduct);

        if (fetchedProduct) {
            if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
                setSelectedSize(fetchedProduct.sizes[0]);
            }
            const related = getRelatedProducts(fetchedProduct, allProducts);
            setRelatedProducts(related);
        }
        setIsLoading(false);
    }

    if (slug) {
      fetchProductData();
    }
  }, [slug, firestore]);
  
  if (isLoading || product === undefined) {
    return (
        <div className="container py-12 md:py-24">
            <BackButton />
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (!product) {
    notFound();
  }

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
    setTimeout(() => setAddedToCart(false), 3000); // Reset after 3 seconds
  };
  
  const imageUrl = ('image' in product && product.image ? product.image.imageUrl : product.imageUrl) || '';
  const imageDescription = ('image' in product && product.image ? product.image.description : product.description) || '';
  const imageHint = ('image' in product && product.image ? product.image.imageHint : '') || '';

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={imageDescription}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint={imageHint}
          />
        </div>
        <div className="flex flex-col h-full">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary mt-2">{product.price}</p>
          <p className="text-muted-foreground mt-4 text-lg flex-grow">{product.description}</p>
          
           <div className="mt-8 space-y-4">
                <div>
                    <label htmlFor="quantity-select" className="text-sm font-medium text-muted-foreground">Quantity</label>
                     <Select 
                        value={String(quantity)} 
                        onValueChange={(value) => setQuantity(parseInt(value, 10))}
                     >
                        <SelectTrigger id="quantity-select" className="w-full md:w-1/2">
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
                            <SelectTrigger id="size-select" className="w-full md:w-1/2">
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
            <Button size="lg" onClick={handleAddToCart} className="w-full" disabled={addedToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </Button>
             <Button size="lg" variant="outline" className="w-full" asChild>
                <a href={product.revolutLink} target="_blank" rel="noopener noreferrer">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Buy Now
                </a>
              </Button>
             {addedToCart && (
              <Button size="lg" variant="ghost" className="w-full" asChild>
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
            {relatedProducts.map((item: Product) => {
               const relatedImageUrl = ('image' in item && item.image ? item.image.imageUrl : item.imageUrl) || '';
               const relatedImageDescription = ('image' in item && item.image ? item.image.description : item.description) || '';
               const relatedImageHint = ('image' in item && item.image ? item.image.imageHint : '') || '';

               return (
               <Card key={item.id} className="overflow-hidden group relative flex flex-col">
                    <CardContent className="p-0 flex-grow">
                        <Link href={`/store/${item.type}/${item.slug}`} className="block aspect-square relative">
                          <Image
                              src={relatedImageUrl}
                              alt={relatedImageDescription}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, 50vw"
                              data-ai-hint={relatedImageHint}
                          />
                        </Link>
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
            )})}
          </div>
        </div>
      )}
    </div>
  );
}

// The main export must be a basic Server Component that passes params to the client component.
export default function MerchPage({ params }: { params: { slug: string } }) {
  return <ProductPageContent slug={params.slug} />;
}
