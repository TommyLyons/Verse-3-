
'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Eye, CheckCircle, DownloadCloud } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useState, use } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProductPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const product = getProductBySlug(params.slug);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to purchase digital products.',
      });
      return;
    }
    if (!firestore || !product.downloadUrl) return;

    setIsProcessingPurchase(true);

    try {
        const purchasesCollection = collection(firestore, 'users', user.uid, 'purchasedProducts');
        
        // Check if the user has already purchased this item
        const q = query(purchasesCollection, where('productId', '==', String(product.id)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            toast({
                title: 'Already Purchased',
                description: 'You already own this item. Check your profile for downloads.',
            });
            router.push('/profile');
            return;
        }

        const purchaseData = {
            productId: String(product.id),
            productName: product.name,
            downloadUrl: product.downloadUrl,
            purchasedAt: serverTimestamp(),
        };

        // Use the non-blocking add function
        addDocumentNonBlocking(purchasesCollection, purchaseData);

        // Open Revolut link in a new tab
        window.open(product.revolutLink, '_blank');

        toast({
            title: 'Purchase Processing!',
            description: 'Please complete the payment. Your download will be available in your profile shortly.',
        });

        // Redirect to profile page after a short delay to allow payment pop-up
        setTimeout(() => {
            router.push('/profile');
        }, 3000);

    } catch (error) {
        console.error("Purchase error:", error);
        toast({
            variant: 'destructive',
            title: 'Purchase Failed',
            description: 'There was an error processing your purchase. Please try again.',
        });
    } finally {
        setIsProcessingPurchase(false);
    }
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
            {product.digital ? (
                <Button size="lg" onClick={handlePurchase} className="w-full" disabled={isProcessingPurchase || isUserLoading}>
                  <DownloadCloud className="mr-2 h-5 w-5" />
                  {isProcessingPurchase ? 'Processing...' : 'Buy & Download'}
                </Button>
            ) : (
              <>
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
              </>
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
