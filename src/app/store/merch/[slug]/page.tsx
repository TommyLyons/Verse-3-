
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, use, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/products';

function ProductPageContent({ slug }: { slug: string }) {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => query(collection(firestore, 'products')), [firestore]);
  const { data: allDbProducts, isLoading: isDbLoading } = useCollection(productsQuery);
  
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (isDbLoading) return;

      setIsLoading(true);
      const fetchedProduct = await getProductBySlug(slug, allDbProducts || []);
      setProduct(fetchedProduct);

      if (fetchedProduct) {
        const related = getRelatedProducts(fetchedProduct, allDbProducts || []);
        setRelatedProducts(related);
      }
      setIsLoading(false);
    }

    fetchProduct();
  }, [slug, allDbProducts, isDbLoading]);
  
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
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000); // Reset after 3 seconds
  };
  
  const imageUrl = 'image' in product && product.image ? (product.image as any).imageUrl : (product as any).imageUrl;
  const imageDescription = 'image' in product && product.image ? (product.image as any).description : (product as any).description;

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
            {relatedProducts.map((item: any) => {
               const relatedImageUrl = 'image' in item && item.image ? item.image.imageUrl : item.imageUrl;
               const relatedImageDescription = 'image' in item && item.image ? item.image.description : item.description;

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


export default function ProductPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  // The `use` hook is used to handle the promise for the params.
  const params = use(paramsPromise);

  // The rendering logic is moved to a separate component
  // that can use hooks like `useCollection`.
  return <ProductPageContent slug={params.slug} />;
}
