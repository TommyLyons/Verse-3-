
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts, Product } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { getProducts as getFlowProducts } from '@/ai/flows/get-products-flow';

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
    async function fetchAllProducts() {
        if (isDbLoading) return;
        setIsLoading(true);

        const flowProducts = await getFlowProducts('Crude City');
        const allProducts = [...(allDbProducts || []), ...flowProducts];

        const fetchedProduct = await getProductBySlug(slug, allProducts);
        setProduct(fetchedProduct);

        if (fetchedProduct) {
            const related = getRelatedProducts(fetchedProduct, allProducts);
            setRelatedProducts(related);
        }
        setIsLoading(false);
    }

    fetchAllProducts();
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


export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductPageContent slug={params.slug} />;
}
